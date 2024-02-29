import {
  JSONStructure,
  Variable,
  VariableForm,
  VariableGroup,
} from '../../interface';

export interface MatchGroups {
  [datasetIDs: string]: {
    importedGroupID: string;
    varList: string;
  };
}

export interface MatchVariables {
  [importedVariableID: string]: { datasetID: string; variable: Variable };
}

export function matchGroups(
  importVariableGroups: VariableGroup[],
  datasetVariableGroups: VariableGroup[],
): MatchGroups {
  const groupMatched: MatchGroups = {};
  importVariableGroups.map((importVariableGroup) => {
    datasetVariableGroups.map((datasetVariableGroup) => {
      if (importVariableGroup.labl === datasetVariableGroup.labl) {
        groupMatched[datasetVariableGroup['@_ID']] = {
          importedGroupID: importVariableGroup['@_ID'],
          varList: importVariableGroup['@_var'],
        };
      }
    });
  });
  return groupMatched;
}

export function matchVariableIDs(
  importVariables: Variable[],
  datasetVariables: Variable[],
): MatchVariables {
  const variablesMatched: MatchVariables = {};
  importVariables.map((importVariable) => {
    datasetVariables.map((datasetVariables) => {
      if (importVariable['@_name'] === datasetVariables['@_name']) {
        variablesMatched[importVariable['@_ID']] = {
          datasetID: datasetVariables['@_ID'],
          variable: importVariable,
        };
      }
    });
  });
  return variablesMatched;
}

export function createNewVarGroups(
  groupsMatched: MatchGroups,
  variablesMatched: MatchVariables,
  datasetVariableGroups: VariableGroup[],
): VariableGroup[] {
  const newGroups: VariableGroup[] = [];
  datasetVariableGroups.map((variableGroup) => {
    if (groupsMatched[variableGroup['@_ID']]) {
      // const variables = variableGroup['@_var'].split(' ')
      const importedVariables =
        groupsMatched[variableGroup['@_ID']].varList.split(' ');
      const newVariables: string[] = [];
      importedVariables.map((variableID) => {
        newVariables.push(variablesMatched[variableID].datasetID);
      });
      variableGroup['@_var'] = [
        ...variableGroup['@_var'].split(' '),
        ...newVariables,
      ].join(' ');
    }
    newGroups.push(variableGroup);
  });
  return newGroups;
}

export function createNewVariables(
  matchedVariables: MatchVariables,
  datasetVariables: Variable[],
  variableTemplate: VariableForm,
): Variable[] {
  const newVariables: Variable[] = [];
  datasetVariables.map((variable) => {
    if (matchedVariables[variable['@_ID']]) {
      console.log(matchedVariables[variable['@_ID']]);
      if (variableTemplate.label !== 'null') {
        variable.labl['#text'] =
          matchedVariables[variable['@_ID']].variable.labl['#text'];
      }
      if (variableTemplate.universe) {
        variable.universe =
          matchedVariables[variable['@_ID']].variable.universe;
      }
      if (variableTemplate.notes) {
        variable.notes['#text'] =
          matchedVariables[variable['@_ID']].variable.notes['#text'];
      }
      if (variableTemplate.weight) {
        variable['@_wgt-var'] =
          matchedVariables[variable['@_ID']].variable['@_wgt-var'];
      }
      if (variableTemplate.literalQuestion) {
        variable.qstn = {
          ...variable.qstn,
          qstnLit:
            matchedVariables[variable['@_ID']].variable.qstn.qstnLit ||
            variable.qstn.qstnLit ||
            '',
        };
      }
      if (variableTemplate.interviewQuestion) {
        variable.qstn = {
          ...variable.qstn,
          ivuInstr:
            matchedVariables[variable['@_ID']].variable.qstn.ivuInstr ||
            variable.qstn.ivuInstr ||
            '',
        };
      }
      if (variableTemplate.postQuestion) {
        variable.qstn = {
          ...variable.qstn,
          postQTxt:
            matchedVariables[variable['@_ID']].variable.qstn.postQTxt ||
            variable.qstn.postQTxt ||
            '',
        };
      }
    }
    newVariables.push(variable);
  });
  return newVariables;
}
