import {
  ImportVariableFormTemplate,
  MatchVariables,
  Variable,
  VariableGroup,
} from './xml.interface';

interface VariableForm {
  label: string;
  literalQuestion: string;
  interviewQuestion: string;
  postQuestion: string;
  universe: string;
  notes: string;
  assignedWeight: string;
  isWeight: boolean;
}

interface PartialVariableForm {
  label: string;
  literalQuestion: string;
  interviewQuestion: string;
  postQuestion: string;
  universe: string;
  notes: string;
}

function updateGivenVariable(
  variable: Variable,
  newVariableValue: VariableForm,
): Variable {
  let updatedVariable = structuredClone(variable);
  if (updatedVariable.labl?.['#text']) {
    updatedVariable.labl = {
      '#text': newVariableValue.label,
      '@_level': 'variable',
    };
  } else {
    updatedVariable.labl = {
      ...updatedVariable.labl,
      '#text': newVariableValue.label,
    };
  }
  if (newVariableValue.isWeight && updatedVariable['@_wgt']) {
    updatedVariable['@_wgt'] = newVariableValue.isWeight ? 'wgt' : '';
  } else {
    updatedVariable = {
      ...updatedVariable,
      '@_wgt': newVariableValue.isWeight ? 'wgt' : '',
    };
  }
  if (newVariableValue.isWeight && updatedVariable['@_wgt-var']) {
    updatedVariable['@_wgt-var'] = newVariableValue.isWeight
      ? ''
      : newVariableValue.assignedWeight;
  } else {
    updatedVariable = {
      ...updatedVariable,
      '@_wgt-var': newVariableValue.isWeight
        ? ''
        : newVariableValue.assignedWeight,
    };
  }
  if (Array.isArray(updatedVariable.notes)) {
    updatedVariable.notes[1] = newVariableValue.notes;
  } else {
    updatedVariable = {
      ...updatedVariable,
      notes: [updatedVariable.notes, newVariableValue.notes],
    };
  }
  if (!updatedVariable.qstn) {
    updatedVariable.qstn = {
      qstnLit: newVariableValue.literalQuestion,
      postQTxt: newVariableValue.postQuestion,
      ivuInstr: newVariableValue.interviewQuestion,
    };
  } else {
    updatedVariable.qstn = {
      ...updatedVariable.qstn,
      qstnLit: newVariableValue.literalQuestion,
      postQTxt: newVariableValue.postQuestion,
      ivuInstr: newVariableValue.interviewQuestion,
    };
  }
  updatedVariable = {
    ...updatedVariable,
    universe: newVariableValue.universe.length
      ? newVariableValue.universe
      : updatedVariable.universe,
  };
  return updatedVariable;
}

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

  Object.keys(frequencyTableForSelectedVariables).forEach((variableID) => {
    if (duplicateVariables[variableID]) {
      const currentCategories = duplicateVariables[variableID].catgry;
      console.log('Weight ID: ', !!weightID);
      if (currentCategories && Array.isArray(currentCategories)) {
        currentCategories.map((category) => {
          if (Array.isArray(category.catStat)) {
            category.catStat = [
              category.catStat[0],
              {
                '#text':
                  weightID !== 'remove'
                    ? frequencyTableForSelectedVariables[variableID][
                        category.catValu
                      ] || 0
                    : 0,
                '@_type': 'freq',
                '@_wgtd': 'wgtd',
                '@_wgt-var': weightID !== 'remove' ? weightID : '',
              },
            ];
          } else {
            category.catStat = [
              category.catStat,
              {
                '#text':
                  weightID !== 'remove'
                    ? frequencyTableForSelectedVariables[variableID][
                        category.catValu
                      ] || 0
                    : 0,
                '@_type': 'freq',
                '@_wgtd': 'wgtd',
                '@_wgt-var': weightID !== 'remove' ? weightID : '',
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

export function fullyChangeMultipleVariables(
  allVariablesArray: Variable[],
  idsOfvariablesToBeChanged: string[],
  newVariableValue: PartialVariableForm,
) {
  const updatedVariableList: Variable[] = [];
  structuredClone(allVariablesArray).forEach((variable) => {
    let tempVar: Variable = variable;
    if (idsOfvariablesToBeChanged.includes(variable['@_ID'])) {
      const patchedVariable: VariableForm = {
        ...newVariableValue,
        label: newVariableValue.label.length
          ? newVariableValue.label
          : variable.labl['#text'],
        isWeight: !!variable['@_wgt'],
        assignedWeight: variable['@_wgt-var'],
      };
      tempVar = updateGivenVariable(variable, patchedVariable);
    }
    updatedVariableList.push(tempVar);
  });

  return updatedVariableList;
}

export function changeAssignedWeightForMultipleVariables(
  allVariablesArray: Variable[],
  idsOfvariablesToBeChanged: string[],
  assignedWeight: string,
) {
  const updatedVariableList: Variable[] = [];
  structuredClone(allVariablesArray).forEach((variable) => {
    let tempVar: Variable = variable;
    if (idsOfvariablesToBeChanged.includes(variable['@_ID'])) {
      const patchedVariable: VariableForm = {
        label: variable.labl?.['#text'] ? variable.labl['#text'] : '',
        literalQuestion: variable.qstn?.qstnLit ? variable.qstn.qstnLit : '',
        interviewQuestion: variable.qstn?.ivuInstr
          ? variable.qstn.ivuInstr
          : '',
        postQuestion: variable.qstn?.postQTxt ? variable.qstn.postQTxt : '',
        universe: variable.universe || '',
        notes: Array.isArray(variable.notes) ? variable.notes[1] : '',
        isWeight: !!variable['@_wgt'],
        assignedWeight:
          assignedWeight === 'remove' || !!variable['@_wgt']
            ? ''
            : assignedWeight,
      };
      tempVar = updateGivenVariable(variable, patchedVariable);
    }
    updatedVariableList.push(tempVar);
  });

  return assignedWeight.length ? updatedVariableList : allVariablesArray;
}

export function changeSingleVariable(
  variableArray: Variable[],
  variableID: string,
  newVariableValue: VariableForm,
) {
  const updatedVariableList: Variable[] = [];
  structuredClone(variableArray).forEach((variable) => {
    let tempVar: Variable = variable;
    if (variable['@_ID'] === variableID) {
      tempVar = updateGivenVariable(variable, newVariableValue);
    }
    updatedVariableList.push(tempVar);
  });

  return updatedVariableList;
}

export function changeGroupsForSingleVariable(
  variableGroups: VariableGroup[] | VariableGroup,
  variableID: string,
  groups: string[],
) {
  const dereferencedArray: VariableGroup[] = [];
  // First remove all references from other groups
  let clonedVariableGroups = structuredClone(variableGroups);
  if (!Array.isArray(clonedVariableGroups) && !!clonedVariableGroups) {
    clonedVariableGroups = [clonedVariableGroups];
  }
  for (const variableGroup of clonedVariableGroups || []) {
    if (variableGroup['@_var']?.split(' ').includes(variableID)) {
      const index = variableGroup['@_var']?.split(' ').indexOf(variableID);
      const variables = variableGroup['@_var'].split(' ');
      if (index !== -1) {
        variables.splice(index, 1);
        variableGroup['@_var'] = variables.join(' ');
      }
    }
    dereferencedArray.push(variableGroup);
  }

  const updatedGroupArray: VariableGroup[] = [];
  // Then insert variable ID in selected groups
  dereferencedArray.forEach((variableGroup) => {
    if (groups.includes(variableGroup['@_ID'])) {
      if (variableGroup['@_var']?.split(' ').length) {
        variableGroup['@_var'] = variableGroup['@_var'] + ' ' + variableID;
      } else {
        variableGroup['@_var'] = '' + variableID + '';
      }
    }
    updatedGroupArray.push(variableGroup);
  });
  return updatedGroupArray;
}

export function changeGroupsForMultipleVariables(
  variableGroups: VariableGroup[],
  variableIDs: string[],
  newGroups: string[],
): VariableGroup[] {
  const updatedGroupArray: VariableGroup[] = [];
  let clonedVariableGroups = structuredClone(variableGroups);
  if (!Array.isArray(clonedVariableGroups) && !!clonedVariableGroups) {
    clonedVariableGroups = [clonedVariableGroups];
  }
  for (const variableGroup of clonedVariableGroups || []) {
    if (newGroups.includes(variableGroup['@_ID'])) {
      const variablesAsArray = variableGroup['@_var']?.length
        ? variableGroup['@_var']?.split(' ') || []
        : [];
      // Add variables that are not already in the group
      for (const variableID of variableIDs) {
        if (!variablesAsArray.includes(variableID)) {
          variablesAsArray.push(variableID);
        }
      }
      variableGroup['@_var'] = variablesAsArray.join(' ');
    }
    updatedGroupArray.push(variableGroup);
  }
  return updatedGroupArray;
}

export function renameVariableGroup(
  duplicateVariableGroups: VariableGroup[] | VariableGroup,
  groupID: string,
  newLabel: string,
) {
  const variableGroupArrayLength: number = Array.isArray(
    duplicateVariableGroups,
  )
    ? duplicateVariableGroups.length
    : 1;
  for (let i = 0; i < variableGroupArrayLength; i++) {
    const currentVariableGroup = Array.isArray(duplicateVariableGroups)
      ? duplicateVariableGroups[i]
      : duplicateVariableGroups;
    if (currentVariableGroup['@_ID'] === groupID) {
      currentVariableGroup.labl = newLabel;
      break;
    }
  }
  return duplicateVariableGroups;
}

export function deleteVariableGroup(
  duplicateVariableGroups: VariableGroup[] | VariableGroup,
  groupID: string,
) {
  const variableGroupArrayLength: number = Array.isArray(
    duplicateVariableGroups,
  )
    ? duplicateVariableGroups.length
    : 1;
  let index = -1;
  for (let i = 0; i < variableGroupArrayLength; i++) {
    const currentVariableGroup = Array.isArray(duplicateVariableGroups)
      ? duplicateVariableGroups[i]
      : duplicateVariableGroups;
    if (currentVariableGroup['@_ID'] === groupID) {
      index = i;
      break;
    }
  }
  if (index > -1) {
    if (Array.isArray(duplicateVariableGroups)) {
      duplicateVariableGroups.splice(index, 1);
    } else {
      return [];
    }
  }
  return duplicateVariableGroups;
}

export function removeVariablesFromGroups(
  groupID: string,
  variableIDs: string[],
  duplicateVariableGroups: VariableGroup[] | VariableGroup,
) {
  // If the variable groups are not an array (when there is only one variable group), we need to make it an array
  const variableGroupArrayLength: number = Array.isArray(
    duplicateVariableGroups,
  )
    ? duplicateVariableGroups.length
    : 1;
  for (let i = 0; i < variableGroupArrayLength; i++) {
    const currentVariableGroup = Array.isArray(duplicateVariableGroups)
      ? duplicateVariableGroups[i]
      : duplicateVariableGroups;
    if (currentVariableGroup['@_ID'] === groupID) {
      const variableListAsArray: string[] =
        currentVariableGroup['@_var']?.split(' ') || [];
      let i = variableListAsArray.length;
      while (i--) {
        if (variableIDs.includes(variableListAsArray[i])) {
          variableListAsArray.splice(i, 1);
        }
      }
      currentVariableGroup['@_var'] = variableListAsArray.join(' ');
      break;
    }
  }
  return duplicateVariableGroups;
}

export function matchVariableIDs(
  importedVariables: Variable[],
  datasetVariables: Variable[],
): MatchVariables {
  const matchedVariables: MatchVariables = {};
  // First we loop through the imported dataset
  importedVariables.forEach((variableImported) => {
    // For each dataset we go through our current dataset to find the matching name
    for (const variableInCurrentDataset of datasetVariables) {
      if (variableInCurrentDataset['@_name'] === variableImported['@_name']) {
        matchedVariables[variableInCurrentDataset['@_ID']] = {
          importedVariableID: variableImported['@_ID'],
          importedVariable: variableImported,
        };
      }
    }
  });
  return matchedVariables;
}

export function updateGroups(
  groups: VariableGroup[],
  matchedVariableIDs: MatchVariables,
): VariableGroup[] {
  const duplicateVariableGroups: VariableGroup[] = [];
  groups.forEach((group) => {
    const flipMatched: { [oldVariableID: string]: string } = {};
    Object.keys(matchedVariableIDs).map((id) => {
      flipMatched[matchedVariableIDs[id].importedVariableID] = id;
    });
    const groupVariables = group['@_var']?.split(' ') || [];
    const newVars: string[] = [];
    if (groupVariables.length) {
      groupVariables.forEach((variable) => {
        newVars.push(flipMatched[variable]);
      });
    }
    duplicateVariableGroups.push({
      ...group,
      '@_var': newVars.length ? newVars.join(' ') : group['@_var'],
      '@_ID': `VG${Math.floor(Math.random() * 90000) + 10000}`,
    });
  });
  return duplicateVariableGroups;
}

export function createNewVariables(
  variablesMatched: MatchVariables,
  variables: Variable[],
  variableTemplate: ImportVariableFormTemplate,
): Variable[] {
  const newVariables: Variable[] = [];
  const reverseLookup: {
    [importedVariableId: string]: {
      currentDatasetVariableID: string;
      importedVariable: Variable;
    };
  } = {};

  Object.keys(variablesMatched).forEach((key) => {
    reverseLookup[variablesMatched[key].importedVariableID] = {
      currentDatasetVariableID: key,
      importedVariable: variablesMatched[key].importedVariable,
    };
  });

  structuredClone(variables).forEach((variable) => {
    if (variablesMatched[variable['@_ID']]) {
      const updatedVariable = editSingleVariable(
        variable,
        variableTemplate,
        variablesMatched[variable['@_ID']],
        reverseLookup,
      );
      // console.log(updatedVariable);
      newVariables.push(updatedVariable);
    } else {
      newVariables.push(variable);
    }
  });
  // console.log(newVariables);
  return newVariables;
}

function editSingleVariable(
  currentVariable: Variable,
  variableTemplate: ImportVariableFormTemplate,
  importedVariablesMatched: {
    importedVariable: Variable;
    importedVariableID: string;
  },
  reverseLookup: {
    [importedVariableID: string]: {
      currentDatasetVariableID: string;
      importedVariable: Variable;
    };
  },
): Variable {
  const currentVariableCloned = structuredClone(currentVariable);
  if (variableTemplate.label) {
    if (currentVariableCloned.labl?.['#text']) {
      currentVariableCloned.labl['#text'] =
        importedVariablesMatched.importedVariable.labl?.['#text'] || '';
    }
  }
  if (variableTemplate.notes) {
    // current var has no notes
    if (!currentVariableCloned.notes) {
      currentVariableCloned.notes =
        importedVariablesMatched.importedVariable.notes;
    }
    // current var only has dataverse signature
    if (
      currentVariableCloned.notes &&
      !Array.isArray(currentVariableCloned.notes)
    ) {
      currentVariableCloned.notes = [currentVariableCloned.notes, ''];
    }
    if (Array.isArray(importedVariablesMatched.importedVariable.notes)) {
      currentVariableCloned.notes = [
        currentVariableCloned.notes[0],
        importedVariablesMatched.importedVariable.notes[1],
      ];
    }
  }
  if (variableTemplate.weight) {
    const importedVariable =
      importedVariablesMatched.importedVariable['@_wgt-var'];
    currentVariableCloned['@_wgt-var'] = reverseLookup[importedVariable]
      ? reverseLookup[importedVariable]?.currentDatasetVariableID
      : '';
    currentVariableCloned['@_wgt'] = importedVariablesMatched.importedVariable[
      '@_wgt'
    ]
      ? importedVariablesMatched.importedVariable['@_wgt']
      : '';
    currentVariableCloned.catgry =
      importedVariablesMatched.importedVariable.catgry;
  }
  if (!currentVariable.qstn) {
    currentVariableCloned.qstn = {
      ivuInstr: '',
      qstnLit: '',
      postQTxt: '',
    };
  }
  if (variableTemplate.literalQuestion) {
    currentVariableCloned.qstn = {
      ...currentVariable.qstn,
      qstnLit:
        importedVariablesMatched.importedVariable.qstn?.qstnLit ||
        currentVariable.qstn?.qstnLit ||
        '',
    };
  }
  if (variableTemplate.interviewQuestion) {
    currentVariableCloned.qstn = {
      ...currentVariable.qstn,
      ivuInstr:
        importedVariablesMatched.importedVariable.qstn?.ivuInstr ||
        currentVariable.qstn?.ivuInstr ||
        '',
    };
  }
  if (variableTemplate.postQuestion) {
    currentVariableCloned.qstn = {
      ...currentVariable.qstn,
      postQTxt:
        importedVariablesMatched.importedVariable.qstn?.postQTxt ||
        currentVariable.qstn?.postQTxt ||
        '',
    };
  }
  if (variableTemplate.universe) {
    currentVariableCloned.universe =
      importedVariablesMatched.importedVariable.universe;
  }
  return currentVariableCloned;
}

export function extractUrlAndToken(url: string) {
  if (!url) {
    return null;
  }
  try {
    const parsedUrl = new URL(url);
    const siteURL = `${parsedUrl.protocol}//${parsedUrl.host}`;
    const apiKey = parsedUrl.searchParams.get('token');
    return {
      siteURL: siteURL,
      apiKey: apiKey,
    };
  } catch (e) {
    return null;
  }
}
