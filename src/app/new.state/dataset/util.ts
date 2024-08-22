import { Variable } from '../xml/xml.interface';

export function changeWeightForSelectedVariables(
  allVariables: { [variableID: string]: Variable },
  selectedVariables: string[],
  weightID: string,
  variablesWithCrossTabMetadata: { [variableID: string]: string[] },
): { [variableID: string]: Variable } {
  const frequencyTableForSelectedVariables: {
    [variableID: string]: { [categoryID: string]: number };
  } = {};
  const duplicateVariables = structuredClone(allVariables);

  selectedVariables.forEach((variableID) => {
    const selectedVariableCrossTab = variablesWithCrossTabMetadata[variableID];
    const weightVariableCrossTab = variablesWithCrossTabMetadata[weightID];
    const frequencyTable: { [categoryID: string]: number } = {};

    weightVariableCrossTab.forEach((weightValue, index) => {
      const currentFrequencyTableValue =
        frequencyTable[selectedVariableCrossTab[index]];
      if (currentFrequencyTableValue) {
        frequencyTable[selectedVariableCrossTab[index]] += Number(weightValue);
      } else {
        frequencyTable[selectedVariableCrossTab[index]] = Number(weightValue);
      }
    });

    frequencyTableForSelectedVariables[variableID] = frequencyTable;
  });

  Object.keys(frequencyTableForSelectedVariables).forEach((variableID) => {
    if (duplicateVariables[variableID]) {
      const currentCategories = duplicateVariables[variableID].catgry;
      currentCategories.map((category) => {
        if (Array.isArray(category.catStat)) {
          category.catStat = [
            category.catStat[0],
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
  });

  return duplicateVariables;
}
