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
    if (processedCategories[key]) {
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
  }[],
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
    labels[item.variableID] = newLabel;
    item.orientation === 'cols' ? cols.push(newLabel) : rows.push(newLabel);
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
  });
  return data;
}
