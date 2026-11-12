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

export const CROSS_TAB_DISPLAY_MODES = [
  'SHOW_VALUE',
  'ROW_PERC',
  'COL_PERC',
  'TOTAL_PERC',
] as const;

export type CrossTabDisplayMode = (typeof CROSS_TAB_DISPLAY_MODES)[number];

type CrossTabObservation = { [categoryLabel: string]: string | number };

interface CrossTabInput {
  rows: string[];
  cols: string[];
  table: CrossTabObservation[];
}

// Row and column keys are kept as one label per variable. They are never
// joined into a single string, because category labels may themselves contain
// any separator ("1 - 2 people").
interface CrossTabMatrix {
  rowKeys: string[][];
  colKeys: string[][];
  cell: (rowKey: string[], colKey: string[]) => number;
  rowTotal: (rowKey: string[]) => number;
  colTotal: (colKey: string[]) => number;
  grandTotal: number;
}

const keyID = (key: string[]): string => JSON.stringify(key);

// The category labels of one observation for the given variables, or null
// when the observation has no value for one of them.
function keyFor(
  entry: CrossTabObservation,
  variables: string[],
): string[] | null {
  const key: string[] = [];
  for (const variable of variables) {
    const label = entry[variable];
    if (label === undefined || label === null || label === '') {
      return null;
    }
    key.push(String(label));
  }
  return key;
}

function addTo(totals: Map<string, number>, id: string, amount: number): void {
  totals.set(id, (totals.get(id) ?? 0) + amount);
}

// Sums the `value` (weight) of every observation per row/column combination.
// Keys are returned in first-seen order.
function aggregateCrossTab(crossTabData: CrossTabInput): CrossTabMatrix {
  const { rows, cols, table } = crossTabData;
  const rowKeys = new Map<string, string[]>();
  const colKeys = new Map<string, string[]>();
  const cells = new Map<string, number>();
  const rowTotals = new Map<string, number>();
  const colTotals = new Map<string, number>();
  let grandTotal = 0;

  for (const entry of table) {
    const rowKey = keyFor(entry, rows);
    const colKey = keyFor(entry, cols);
    if (!rowKey || !colKey) {
      continue;
    }
    const rowID = keyID(rowKey);
    const colID = keyID(colKey);
    if (!rowKeys.has(rowID)) {
      rowKeys.set(rowID, rowKey);
    }
    if (!colKeys.has(colID)) {
      colKeys.set(colID, colKey);
    }
    // Same rule as the on-screen table's sum: a weight of zero adds zero and
    // a non-numeric weight adds nothing. Never substitute 1.
    const weight = Number(entry['value']);
    const amount = Number.isNaN(weight) ? 0 : weight;
    addTo(cells, keyID([rowID, colID]), amount);
    addTo(rowTotals, rowID, amount);
    addTo(colTotals, colID, amount);
    grandTotal += amount;
  }

  return {
    rowKeys: Array.from(rowKeys.values()),
    colKeys: Array.from(colKeys.values()),
    cell: (rowKey, colKey) =>
      cells.get(keyID([keyID(rowKey), keyID(colKey)])) ?? 0,
    rowTotal: (rowKey) => rowTotals.get(keyID(rowKey)) ?? 0,
    colTotal: (colKey) => colTotals.get(keyID(colKey)) ?? 0,
    grandTotal,
  };
}

// Weighted table for the cross-tab chart, which needs one text label per bar
// and per series.
export function buildTable(crossTabData: CrossTabInput): {
  table: { [rowKey: string]: { [columnKey: string]: number } };
  rows: string[];
  cols: string[];
} {
  const matrix = aggregateCrossTab(crossTabData);
  const data: { [rowKey: string]: { [columnKey: string]: number } } = {};
  const rowLabels = new Set<string>();
  const colLabels = new Set<string>();

  matrix.rowKeys.forEach((rowKey) => {
    const rowLabel = rowKey.join(' - ');
    rowLabels.add(rowLabel);
    data[rowLabel] = data[rowLabel] ?? {};
    matrix.colKeys.forEach((colKey) => {
      const colLabel = colKey.join(' - ');
      colLabels.add(colLabel);
      data[rowLabel][colLabel] =
        (data[rowLabel][colLabel] ?? 0) + matrix.cell(rowKey, colKey);
    });
  });

  return {
    table: data,
    rows: Array.from(rowLabels),
    cols: Array.from(colLabels),
  };
}

export interface CrossTabCSVOptions {
  /** What each cell shows. Defaults to the weighted count. */
  mode?: CrossTabDisplayMode;
  /** Orders category labels. Pass the on-screen table's comparator so the
   * export lists rows and columns in the same order. */
  compare?: (a: string, b: string) => number;
  /** Human-readable name of the display mode, used where the table has no
   * variable to label a row or column and in the footer. */
  valueLabel?: string;
}

const naturalCompare = new Intl.Collator(undefined, { numeric: true }).compare;

function escapeCSVField(field: string | number): string {
  if (typeof field === 'number') {
    return field.toString();
  }
  // Wrap in quotes and double any existing quotes when the field contains a
  // delimiter, a quote or a line break
  if (/[",\n\r]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function cellDenominator(
  matrix: CrossTabMatrix,
  mode: CrossTabDisplayMode,
  rowKey: string[],
  colKey: string[],
): number | null {
  switch (mode) {
    case 'ROW_PERC':
      return matrix.rowTotal(rowKey);
    case 'COL_PERC':
      return matrix.colTotal(colKey);
    case 'TOTAL_PERC':
      return matrix.grandTotal;
    default:
      return null;
  }
}

// One header row per column variable, one column per row variable:
//
//   ,GENDER,Female,Male
//   HHLDSIZE,TBC_05AR,,
//   1 person,No,483,262
export function generateCrossTabCSV(
  data: CrossTabInput,
  options: CrossTabCSVOptions = {},
): string {
  const { rows, cols } = data;
  const mode = options.mode ?? 'SHOW_VALUE';
  const compare = options.compare ?? naturalCompare;
  const valueLabel = options.valueLabel ?? 'Value';
  const matrix = aggregateCrossTab(data);

  const compareKeys = (a: string[], b: string[]): number => {
    for (let i = 0; i < a.length; i++) {
      const order = compare(a[i], b[i]);
      if (order !== 0) {
        return order;
      }
    }
    return 0;
  };
  const rowKeys = [...matrix.rowKeys].sort(compareKeys);
  const colKeys = [...matrix.colKeys].sort(compareKeys);

  const formatCell = (rowKey: string[], colKey: string[]): string | number => {
    const value = matrix.cell(rowKey, colKey);
    const denominator = cellDenominator(matrix, mode, rowKey, colKey);
    if (denominator === null) {
      return value;
    }
    // Nothing to take a share of: leave blank, as the on-screen table does
    if (!denominator) {
      return '';
    }
    return `${((value / denominator) * 100).toFixed(1)}%`;
  };

  const lines: (string | number)[][] = [];
  const labelColumns = Math.max(rows.length, 1);

  cols.forEach((variable, index) => {
    lines.push([
      ...Array<string>(labelColumns - 1).fill(''),
      variable,
      ...colKeys.map((colKey) => colKey[index]),
    ]);
  });
  if (rows.length > 0) {
    lines.push([
      ...rows,
      ...(cols.length > 0 ? colKeys.map(() => '') : [valueLabel]),
    ]);
  }
  rowKeys.forEach((rowKey) => {
    lines.push([
      ...(rows.length > 0 ? rowKey : [valueLabel]),
      ...colKeys.map((colKey) => formatCell(rowKey, colKey)),
    ]);
  });

  const footer = [
    `Generated on: ${new Date().toLocaleString()}`,
    `Values: ${valueLabel}`,
    `Total Rows: ${rowKeys.length}`,
    `Total Columns: ${colKeys.length}`,
  ];

  return [
    ...lines.map((line) => line.map(escapeCSVField).join(',')),
    '', // blank line separates the table from the footer
    ...footer.map(escapeCSVField),
  ].join('\n');
}
