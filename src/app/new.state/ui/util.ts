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
  Object.keys(crossTabValues).map((key) => {
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
  });
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
  return { labels, rows, cols };
}

export function createTable(
  processedCategories: { [categoryID: string]: string[] },
  rowAndColumnLabels: { [variableID: string]: string },
) {
  const data: { [categoryLabel: string]: string }[] = [];
  Object.keys(processedCategories).map((categoryKeyAsVariableID: string) => {
    // categoryKey here is a variableID
    const item = processedCategories[categoryKeyAsVariableID];
    if (Object.keys(rowAndColumnLabels).includes(categoryKeyAsVariableID)) {
      item.map((categoryLabel: string, index) => {
        if (categoryLabel !== '') {
          if (data[index]) {
            data[index] = {
              ...data[index],
              [rowAndColumnLabels[categoryKeyAsVariableID]]: categoryLabel,
            };
          } else {
            data[index] = {
              [rowAndColumnLabels[categoryKeyAsVariableID]]: categoryLabel,
            };
          }
        } else {
          data[index] = {};
        }
      });
    }
  });
  return data;
}

// Function to count combinations
export function buildTable(crossTabData: {
  rows: string[];
  cols: string[];
  table: { [id: string]: string }[];
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
      if (!!entry[row]) {
        rowArray.push(entry[row]);
      }
    });
    cols.map((column) => {
      if (!!entry[column]) {
        colArray.push(entry[column]);
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
    data[rowKey][columnKey]++;
  }

  return {
    table: data,
    rows: Array.from(rowValues),
    cols: Array.from(columnValues),
  };
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
  datasets: { label: string; data: number[] }[];
} {
  const { table, rows, cols } = crossTabData;
  const labels = rows;
  const datasets: {
    label: string;
    data: number[];
  }[] = [];

  cols.forEach((column) => {
    const dataset: { label: string; data: number[] } = {
      label: column,
      data: [],
    };

    rows.forEach((row) => {
      dataset.data.push(table[row][column] || 0);
    });

    datasets.push(dataset);
  });

  return { labels, datasets };
}
