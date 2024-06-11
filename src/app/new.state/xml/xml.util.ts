import { Variable, VariableGroup } from './xml.interface';

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
  newVariableValue: VariableForm
): Variable {
  const updatedVariable = structuredClone(variable);
  updatedVariable.labl['#text'] = newVariableValue.label;
  updatedVariable.notes['#text'] = newVariableValue.notes;
  updatedVariable['@_wgt'] = newVariableValue.isWeight ? 'wgt' : '';
  updatedVariable['@_wgt-var'] = newVariableValue.isWeight
    ? ''
    : newVariableValue.assignedWeight;
  if (!updatedVariable.qstn) {
    updatedVariable.qstn = {
      qstnLit: newVariableValue.literalQuestion,
      postQTxt: newVariableValue.postQuestion,
      ivuInstr: newVariableValue.interviewQuestion
    };
  }
  return updatedVariable;
}

export function changeMultipleVariables(
  variableArray: Variable[],
  variableID: string[],
  newVariableValue: PartialVariableForm,
  assignedWeight?: string
) {
  const updatedVariableList: Variable[] = [];
  structuredClone(variableArray).forEach((variable) => {
    let tempVar: Variable = variable;
    if (variableID.includes(variable['@_ID'])) {
      const patchedVariable: VariableForm = {
        ...newVariableValue,
        isWeight: !!variable['@_wgt'],
        assignedWeight: assignedWeight || variable['@_wgt-var']
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
  newVariableValue: VariableForm
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
  groups: string[]
) {
  const dereferencedArray: VariableGroup[] = [];
  // First remove all references from other groups
  structuredClone(variableGroups).forEach((variableGroup) => {
    if (variableGroup['@_var']?.split(' ').includes(variableID)) {
      const index = variableGroup['@_var']?.split(' ').indexOf(variableID);
      const variables = variableGroup['@_var'].split(' ');
      if (index !== -1) {
        variables.splice(index, 1);
        variableGroup['@_var'] = variables.join(' ');
      }
    }
    dereferencedArray.push(variableGroup);
  });

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
  newGroups: string[]
) {
  const updatedGroupArray: VariableGroup[] = [];
  (variableGroups).forEach((variableGroup) => {
    if (newGroups.includes(variableGroup['@_ID'])) {
      const variablesAsArray = !!variableGroup['@_var']?.length ? variableGroup['@_var']?.split(' ') || [] : [];
      variablesAsArray.push(...variableIDs);
      variableGroup['@_var'] = variablesAsArray.join(' ');
    }
    updatedGroupArray.push(variableGroup);
  });
  return updatedGroupArray;
}

export function renameVariableGroup(duplicateVariableGroups: VariableGroup[], groupID: string, newLabel: string) {
  const variableGroupArrayLength: number = duplicateVariableGroups.length - 1;
  for (let i = 0; i < variableGroupArrayLength; i++) {
    const currentVariableGroup = duplicateVariableGroups[i];
    if (currentVariableGroup['@_ID'] === groupID) {
      currentVariableGroup.labl = newLabel;
      break;
    }
  }
  return duplicateVariableGroups;
}

export function deleteVariableGroup(duplicateVariableGroups: VariableGroup[], groupID: string) {
  const variableGroupArrayLength: number = duplicateVariableGroups.length - 1;
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

export function removeVariablesFromGroups(groupID: string, variableIDs: string[], duplicateVariableGroups: VariableGroup[]) {

  const variableGroupArrayLength: number = duplicateVariableGroups.length - 1;
  for (let i = 0; i < variableGroupArrayLength; i++) {
    const currentVariableGroup = duplicateVariableGroups[i];
    if (currentVariableGroup['@_ID'] === groupID) {
      const variableListAsArray: string[] = currentVariableGroup['@_var']?.split(' ') || [];
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
