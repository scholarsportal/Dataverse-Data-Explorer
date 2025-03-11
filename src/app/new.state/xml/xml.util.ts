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
  if (updatedVariable['@_wgt']) {
    updatedVariable['@_wgt'] = newVariableValue.isWeight ? 'wgt' : '';
  } else {
    updatedVariable = {
      ...updatedVariable,
      '@_wgt': newVariableValue.isWeight ? 'wgt' : '',
    };
  }
  if (updatedVariable['@_wgt-var']) {
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
    universe: newVariableValue.universe,
  };
  return updatedVariable;
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

export function partiallyChangeMultipleVariables(
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
        assignedWeight: assignedWeight,
      };
      tempVar = updateGivenVariable(variable, patchedVariable);
    }
    updatedVariableList.push(tempVar);
  });

  return updatedVariableList;
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
  variableGroups: VariableGroup[],
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
    console.log('do we get here?');
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
      variableGroup['@_var'] = variableGroup['@_var'] + ' ' + variableID;
    }
    updatedGroupArray.push(variableGroup);
  });
  return updatedGroupArray;
}

export function changeGroupsForMultipleVariables(
  variableGroups: VariableGroup[],
  variableIDs: string[],
  newGroups: string[],
) {
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
      variablesAsArray.push(...variableIDs);
      variableGroup['@_var'] = variablesAsArray.join(' ');
    }
    updatedGroupArray.push(variableGroup);
  }
  return updatedGroupArray;
}

export function renameVariableGroup(
  duplicateVariableGroups: VariableGroup[],
  groupID: string,
  newLabel: string,
) {
  const variableGroupArrayLength: number = duplicateVariableGroups.length;
  for (let i = 0; i < variableGroupArrayLength - 1; i++) {
    const currentVariableGroup = duplicateVariableGroups[i];
    if (currentVariableGroup['@_ID'] === groupID) {
      currentVariableGroup.labl = newLabel;
      break;
    }
  }
  return duplicateVariableGroups;
}

export function deleteVariableGroup(
  duplicateVariableGroups: VariableGroup[],
  groupID: string,
) {
  const variableGroupArrayLength: number = duplicateVariableGroups.length;
  let index = -1;
  for (let i = 0; i < variableGroupArrayLength; i++) {
    const currentVariableGroup = duplicateVariableGroups[i];
    if (currentVariableGroup['@_ID'] === groupID) {
      index = i;
      break;
    }
  }
  if (index > -1) {
    duplicateVariableGroups.splice(index, 1);
  }
  return duplicateVariableGroups;
}

export function removeVariablesFromGroups(
  groupID: string,
  variableIDs: string[],
  duplicateVariableGroups: VariableGroup[],
) {
  const variableGroupArrayLength: number = duplicateVariableGroups.length;
  for (let i = 0; i < variableGroupArrayLength; i++) {
    const currentVariableGroup = duplicateVariableGroups[i];
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
