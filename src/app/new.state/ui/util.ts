// Path: src/app/new.state/ui/util.ts
import { Variable } from '../xml/xml.interface';

export const truncatedText = (text: string) => {
  if (text.length > 15) {
    return text.substring(0, 15) + '...';
  }
  return text;
};

export function matchCategoriesWithLabels(
  processedCategories: {
    [variableID: string]: { [categoryID: string]: string };
  },
  crossTabValues: { [variableID: string]: string[] },
  missingCategories: { [variableID: string]: string[] },
) {
  const matched: { [variableID: string]: string[] } = {};
  for (const key in crossTabValues) {
    if (!Object.keys(processedCategories[key]).length) {
      continue;
    }
    const values: string[] = [];
    if (processedCategories[key] && crossTabValues[key]) {
      crossTabValues[key].map((value) => {
        let toPush = processedCategories[key][value] || '';
        if (missingCategories[key]?.includes(value)) {
          toPush = '';
        }
        values.push(toPush);
      });
    }
    matched[key] = values;
  }
  return matched;
}

export function createRowAndCategoryLabels(
  variablesInCrossTab: {
    variableID: string;
    orientation: 'rows' | 'cols' | '';
  }[] = [],
  processedVariables: { [p: string]: Variable },
): {
  labels: { [variableID: string]: string };
  rows: string[];
  cols: string[];
} {
  const rows: string[] = [];
  const cols: string[] = [];
  const labels: { [variableID: string]: string } = {};
  if (Array.isArray(variablesInCrossTab)) {
    variablesInCrossTab.map((item) => {
      const processed = processedVariables[item.variableID] || null;
      const newLabel = processed
        ? `${processed['@_name']} - ${processed.labl?.['#text'] || 'no-label'}`
        : 'var-not-found';
      if (item.variableID) {
        labels[item.variableID] = newLabel;
        if (item.orientation === 'cols') {
          cols.push(newLabel);
        } else if (item.orientation === 'rows') {
          rows.push(newLabel);
        }
      }
    });
  }
  return { labels, rows, cols };
}

interface CrossTabResult {
  table: {
    [rowKey: string]: {
      [colKey: string]: number;
    };
  };
  rows: string[];
  cols: string[];
  chart: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
  formatted: {
    rowVariables: string[];
    colVariables: string[];
    colGroups: {
      mainLabel: string;
      subGroups: {
        label: string;
        columns: string[];
      }[];
    }[];
    rows: {
      labels: string[];
      cells: number[];
      rowTotal: number;
    }[];
    columnTotals: number[];
    grandTotal: number;
  };
}

export function buildCrossTabTable(
  processedCategories: { [variableID: string]: string[] },
  labels: { [variableID: string]: string },
  rowVariables: string[],
  colVariables: string[],
  weights?: number[],
): CrossTabResult {
  const data: { [rowKey: string]: { [colKey: string]: number } } = {};
  const rowValues = new Set<string>();
  const columnValues = new Set<string>();

  // Get array length (all arrays have same length)
  const observationCount =
    processedCategories[Object.keys(processedCategories)[0]]?.length || 0;

  // Process each observation
  for (let i = 0; i < observationCount; i++) {
    const weight = weights?.[i] ?? 1;

    // Get row and column values for this observation
    const rowLabels = rowVariables
      .map((varId) => processedCategories[varId]?.[i])
      .filter(Boolean);
    const colLabels = colVariables
      .map((varId) => processedCategories[varId]?.[i])
      .filter(Boolean);

    // Skip if missing any values
    if (
      rowLabels.length !== rowVariables.length ||
      colLabels.length !== colVariables.length
    ) {
      continue;
    }

    const rowKey = rowLabels.join(' - ');
    const colKey = colLabels.join(' - ');

    rowValues.add(rowKey);
    columnValues.add(colKey);

    if (!data[rowKey]) {
      data[rowKey] = {};
    }
    if (!data[rowKey][colKey]) {
      data[rowKey][colKey] = 0;
    }
    data[rowKey][colKey] += weight;
  }

  const rows = Array.from(rowValues);
  const cols = Array.from(columnValues);

  // Create chart data
  const chartData = {
    labels: rows,
    datasets: cols.map((colLabel) => ({
      label: colLabel,
      data: rows.map((rowLabel) => data[rowLabel]?.[colLabel] || 0),
    })),
  };

  // Create hierarchical column structure
  const colGroups = colVariables.map((mainVarId) => {
    const uniqueValues = new Set(processedCategories[mainVarId]);
    return {
      mainLabel: labels[mainVarId],
      subGroups: Array.from(uniqueValues).map((value) => {
        // For each value of the first variable, get all combinations with other variables
        const relatedCols = cols.filter((col) => col.startsWith(value));
        return {
          label: value,
          columns: relatedCols.map((col) => {
            const parts = col.split(' - ');
            return parts.length > 1 ? parts.slice(1).join(' - ') : col;
          }),
        };
      }),
    };
  });

  // Create hierarchical row structure
  const formattedRows = rows.map((rowKey) => {
    const rowParts = rowKey.split(' - ');
    return {
      labels: rowParts,
      cells: cols.map((colKey) => data[rowKey]?.[colKey] || 0),
      rowTotal: cols.reduce(
        (sum, colKey) => sum + (data[rowKey]?.[colKey] || 0),
        0,
      ),
    };
  });

  // Calculate column totals
  const columnTotals = cols.map((colKey) =>
    rows.reduce((sum, rowKey) => sum + (data[rowKey]?.[colKey] || 0), 0),
  );

  // Calculate grand total
  const grandTotal = columnTotals.reduce((sum, total) => sum + total, 0);

  const formatted = {
    rowVariables: rowVariables.map((varId) => labels[varId]),
    colVariables: colVariables.map((varId) => labels[varId]),
    colGroups,
    rows: formattedRows,
    columnTotals,
    grandTotal,
  };

  return {
    table: data,
    rows,
    cols,
    chart: chartData,
    formatted,
  };
}

export function createTable(
  processedCategories: { [categoryID: string]: string[] },
  rowAndColumnLabels: { [variableID: string]: string },
  weights?: number[],
) {
  const data: { [categoryLabel: string]: string | number }[] = [];

  Object.keys(processedCategories).forEach(
    (categoryKeyAsVariableID: string) => {
      // categoryKey here is a variableID
      const item = processedCategories[categoryKeyAsVariableID];
      if (Object.keys(rowAndColumnLabels).includes(categoryKeyAsVariableID)) {
        item.map((categoryLabel: string, index) => {
          if (categoryLabel !== '') {
            if (data[index]) {
              data[index] = {
                ...data[index],
                [rowAndColumnLabels[categoryKeyAsVariableID]]: categoryLabel,
                // Add weight if available, otherwise default to 1
                value: weights?.[index] ?? 1,
              };
            } else {
              data[index] = {
                [rowAndColumnLabels[categoryKeyAsVariableID]]: categoryLabel,
                value: weights?.[index] ?? 1,
              };
            }
          } else {
            data[index] = {
              value: weights?.[index] ?? 1,
            };
          }
        });
      }
    },
  );

  return data;
}

export function transformCombinationsToChartData(crossTabData: {
  rows: string[];
  cols: string[];
  table: {
    [rowKey: string]: {
      [columnKey: string]: number;
    };
  };
}): {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
} {
  const { table, rows, cols } = crossTabData;
  const labels = rows;
  const datasets = cols.map((column, index) => ({
    label: column,
    data: rows.map((row) => table[row][column] || 0),
    backgroundColor: `hsla(${index * (360 / cols.length)}, 70%, 50%, 0.5)`,
    borderColor: `hsla(${index * (360 / cols.length)}, 70%, 50%, 1)`,
    borderWidth: 1,
  }));

  return { labels, datasets };
}

interface ChartJSData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export function transformPivotDataToChartData(
  pivotData: any[],
  rows: string[],
  cols: string[],
): ChartJSData {
  // Create a map to store the aggregated values
  const dataMap: { [key: string]: { [key: string]: number } } = {};

  // Initialize the map with all row combinations
  rows.forEach((rowVar) => {
    // Get unique values for this row variable from pivot data
    const uniqueValues = new Set(pivotData.map((item) => item[rowVar]));
    uniqueValues.forEach((value) => {
      if (value) {
        // Skip undefined/null values
        dataMap[value] = {};
      }
    });
  });

  // Fill in the values from pivot data
  pivotData.forEach((item) => {
    rows.forEach((rowVar) => {
      cols.forEach((colVar) => {
        const rowValue = item[rowVar];
        const colValue = item[colVar];
        if (rowValue && colValue) {
          if (!dataMap[rowValue][colValue]) {
            dataMap[rowValue][colValue] = 0;
          }
          dataMap[rowValue][colValue] += item.value || 1;
        }
      });
    });
  });

  // Transform into Chart.js format
  const labels = Object.keys(dataMap);
  const datasets = cols.map((col, index) => ({
    label: col,
    data: labels.map((label) => dataMap[label][col] || 0),
    borderWidth: 1,
  }));

  return { labels, datasets };
}

// Function to build weighted table
export function buildTable(crossTabData: {
  rows: string[];
  cols: string[];
  table: { [categoryLabel: string]: string | number }[]; // Updated type
}) {
  const { rows, cols, table } = crossTabData;

  const data: {
    [rowKey: string]: {
      [columnKey: string]: number;
    };
  } = {};
  const rowValues = new Set<string>();
  const columnValues = new Set<string>();

  for (const entry of table) {
    const rowArray: string[] = [];
    const colArray: string[] = [];

    rows.map((row) => {
      if (entry[row]) {
        rowArray.push(String(entry[row])); // Ensure string conversion
      }
    });
    cols.map((column) => {
      if (entry[column]) {
        colArray.push(String(entry[column])); // Ensure string conversion
      }
    });

    const rowKey = rowArray.join(' - ');
    const columnKey = colArray.join(' - ');
    rowValues.add(rowKey);
    columnValues.add(columnKey);

    if (!data[rowKey]) {
      data[rowKey] = {};
    }
    if (!data[rowKey][columnKey]) {
      data[rowKey][columnKey] = 0;
    }
    // Use the weight value instead of incrementing
    data[rowKey][columnKey] += Number(entry['value']) || 1;
  }

  return {
    table: data,
    rows: Array.from(rowValues),
    cols: Array.from(columnValues),
  };
}

export function generateCrossTabCSV(data: {
  rows: string[];
  cols: string[];
  table: { [id: string]: string; value: string }[];
}) {
  const processedData = buildTable(data);
  const { table, rows: rowLabels, cols: colLabels } = processedData;

  // Helper function to escape CSV fields
  const escapeField = (field: string | number): string => {
    if (typeof field === 'number') return field.toString();
    // If field contains quotes, commas, or newlines, wrap in quotes and escape existing quotes
    if (/[",\n\r]/.test(field)) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const csvRows: string[] = [];

  // Create descriptive header for the intersection cell
  const rowsDescription = rowLabels.length === 1 ? 'Row' : 'Rows';
  const colsDescription = colLabels.length === 1 ? 'Column' : 'Columns';
  const intersectionHeader = escapeField(
    `${rowsDescription} ↓ / ${colsDescription} →`,
  );

  // Add header row with column labels
  const headerRow = [intersectionHeader].concat(
    colLabels.map((col) => escapeField(col)),
  );
  csvRows.push(headerRow.join(','));

  // Add a blank line for better readability
  csvRows.push('');

  // Add data rows
  rowLabels.forEach((rowLabel) => {
    const rowData = [escapeField(rowLabel)];
    colLabels.forEach((colLabel) => {
      const value = table[rowLabel]?.[colLabel] ?? 0;
      rowData.push(escapeField(value));
    });
    csvRows.push(rowData.join(','));
  });

  // Add summary information at the bottom
  csvRows.push(''); // Empty line for separation
  csvRows.push(`"Generated on: ${new Date().toLocaleString()}"`);
  csvRows.push(`"Total Rows: ${rowLabels.length}"`);
  csvRows.push(`"Total Columns: ${colLabels.length}"`);

  return csvRows.join('\n');
}
