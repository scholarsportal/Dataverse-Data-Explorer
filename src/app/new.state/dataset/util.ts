import { Variable } from '../xml/xml.interface';

export function changeWeightForSelectedVariables(
  allVariables: { [variableID: string]: Variable },
  selectedVariables: string[],
  weightID: string,
  variablesWithCrossTabMetadata: { [variableID: string]: string[] },
): Variable[] {
  const frequencyTableForSelectedVariables: {
    [variableID: string]: { [categoryID: string]: number };
  } = {};
  const duplicateVariables = structuredClone(allVariables);

  selectedVariables.forEach((variableID) => {
    const selectedVariableCrossTab = variablesWithCrossTabMetadata[variableID];
    const weightVariableCrossTab = variablesWithCrossTabMetadata[weightID];
    const frequencyTable: { [categoryID: string]: number } = {};
    if (weightVariableCrossTab && Array.isArray(weightVariableCrossTab)) {
      weightVariableCrossTab.forEach((weightValue, index) => {
        const currentFrequencyTableValue =
          frequencyTable[selectedVariableCrossTab[index]];
        if (currentFrequencyTableValue) {
          frequencyTable[selectedVariableCrossTab[index]] +=
            Number(weightValue);
        } else {
          frequencyTable[selectedVariableCrossTab[index]] = Number(weightValue);
        }
      });
    }
    frequencyTableForSelectedVariables[variableID] = frequencyTable;
  });

  console.log(weightID);

  Object.keys(frequencyTableForSelectedVariables).forEach((variableID) => {
    if (duplicateVariables[variableID]) {
      const currentCategories = duplicateVariables[variableID].catgry;
      if (currentCategories && Array.isArray(currentCategories)) {
        // console.log(currentCategories, 'do we get here?');
        currentCategories.map((category) => {
          if (Array.isArray(category.catStat)) {
            category.catStat = [
              category.catStat[0],
              {
                '#text': weightID
                  ? frequencyTableForSelectedVariables[variableID][
                      category.catValu
                    ]
                  : Number.NEGATIVE_INFINITY,
                '@_type': 'freq',
                '@_wgtd': 'wgtd',
                '@_wgt-var': weightID,
              },
            ];
          } else {
            category.catStat = [
              category.catStat,
              {
                '#text':
                  frequencyTableForSelectedVariables[variableID][
                    category.catValu
                  ],
                '@_type': 'freq',
                '@_wgtd': 'wgtd',
                '@_wgt-var': weightID,
              },
            ];
          }
        });
      }
      duplicateVariables[variableID].catgry = currentCategories;
    }
  });
  return Object.values(duplicateVariables);
}
