import {
  NesstarVariable,
  Variable,
  VariableForm,
  VariableFormTemplate,
  VariableGroup,
} from '../../interface';

export interface MatchGroups {
  [datasetIDs: string]: {
    importedGroupID: string;
    varList: string;
  };
}

export interface MatchVariables {
  [datasetID: string]: {
    importedVariableID: string;
    variable: Variable | NesstarVariable | any;
  };
}

export function matchGroups(
  importVariableGroups: VariableGroup[],
  datasetVariableGroups: VariableGroup[],
): MatchGroups {
  const groupMatched: MatchGroups = {};
  importVariableGroups.map((importVariableGroup) => {
    datasetVariableGroups.map((datasetVariableGroup): any => {
      if (importVariableGroup.labl === datasetVariableGroup.labl) {
        groupMatched[datasetVariableGroup['@_ID']] = {
          importedGroupID: importVariableGroup['@_ID'],
          varList: importVariableGroup['@_var'] || '',
        };
      } else {
        groupMatched[importVariableGroup['@_ID']] = {
          importedGroupID: importVariableGroup['@_ID'],
          varList: importVariableGroup['@_var'] || '',
        };
      }
    });
  });
  return groupMatched;
}

export function matchVariableIDs(
  importVariables: Variable[] | any[],
  datasetVariables: Variable[],
): MatchVariables {
  const variablesMatched: MatchVariables = {};
  console.log(importVariables);
  importVariables?.map((importVariable) => {
    datasetVariables.map((datasetVariables) => {
      if (importVariable['@_name'] === datasetVariables['@_name']) {
        variablesMatched[datasetVariables['@_ID']] = {
          importedVariableID: importVariable['@_ID'],
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
  const newVariablesMatched: { [id: string]: string } = {};
  Object.keys(variablesMatched).map((datasetID: string, index: number) => {
    const importedVariableID: string =
      Object.values(variablesMatched)[index].importedVariableID;
    newVariablesMatched[importedVariableID] = datasetID;
  });
  datasetVariableGroups.map((variableGroup) => {
    if (groupsMatched[variableGroup['@_ID']]) {
      // const variables = variableGroup['@_var'].split(' ')
      const importedVariables =
        groupsMatched[variableGroup['@_ID']].varList?.split(' ') || [];
      const newVariables: string[] = [];
      importedVariables.map((variableID) => {
        newVariables.push(newVariablesMatched[variableID]);
      });
      if (variableGroup['@_var']) {
        variableGroup['@_var'] = [
          ...variableGroup['@_var'].split(' '),
          ...newVariables,
        ].join(' ');
      }
    }
    newGroups.push(variableGroup);
  });
  return newGroups;
}

export function createNewVariables(
  matchedVariables: MatchVariables,
  datasetVariables: Variable[],
  variableTemplate: VariableFormTemplate,
): { variables: Variable[]; count: number } {
  const newVariables: Variable[] = [];
  const newVariableReferences: { [oldVariableID: string]: string } = {};
  var changed: number = 0;
  Object.keys(matchedVariables).map((value, index) => {
    newVariableReferences[
      Object.values(matchedVariables)[index].importedVariableID
    ] = value;
  });
  datasetVariables.map((variable) => {
    if (matchedVariables[variable['@_ID']]) {
      if (variableTemplate.label) {
        var text: string = '';
        if (
          typeof matchedVariables[variable['@_ID']].variable.labl === 'string'
        ) {
          text = matchedVariables[variable['@_ID']].variable.labl;
        } else {
          text = matchedVariables[variable['@_ID']].variable.labl['#text'];
        }
        variable.labl = {
          ...variable.labl,
          '#text': text,
        };
      }
      if (variableTemplate.universe) {
        variable.universe =
          matchedVariables[variable['@_ID']].variable.universe;
      }
      if (variableTemplate.notes) {
        if (
          typeof matchedVariables[variable['@_ID']].variable?.notes === 'string'
        ) {
          variable.notes['#text'] =
            matchedVariables[variable['@_ID']].variable.notes;
        } else if (
          matchedVariables[variable['@_ID']].variable?.notes?.['#text']
        ) {
          variable.notes['#text'] =
            matchedVariables[variable['@_ID']].variable.notes['#text'];
        }
      }
      if (variableTemplate.weight) {
        if (
          newVariableReferences[
            matchedVariables[variable['@_ID']].variable['@_wgt-var']
          ]
        ) {
          variable['@_wgt-var'] =
            newVariableReferences[
              matchedVariables[variable['@_ID']].variable['@_wgt-var']
            ];
        }
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
      changed += 1;
    }
    newVariables.push(variable);
  });
  return { variables: newVariables, count: changed };
}
