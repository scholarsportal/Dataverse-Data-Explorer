import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ddiJSONStructure } from './xml.interface';

export const selectXmlFeature =
  createFeatureSelector<{
    dataset?: ddiJSONStructure,
    info?: {
      siteURL: string,
      fileID: number,
      apiKey: string
    }
  }>('xml');

export const selectDatasetVariables =
  createSelector(selectXmlFeature, (state) =>
    state.dataset?.codeBook.dataDscr.var);

export const selectDatasetVariableGroups =
  createSelector(selectXmlFeature, (state) =>
    state.dataset?.codeBook.dataDscr.varGrp);

export const selectDatasetUploadInfo = createSelector(
  selectXmlFeature, state => state);

export const selectVariablesWithCorrespondingGroups = createSelector(
  selectDatasetVariables, selectDatasetVariableGroups, (variables, groups) => {
    const variablesWithCorrespondingGroups: {
      [variableID: string]: string[]
    } = {};
    if (variables && groups) {
      // Loop through groups
      groups.map((variableGroup) => {
        // For each variable group, split the corresponding varlist into an array,
        // then loop through that array
        variableGroup['@_var']?.split(' ').map((variableID) => {
          // If the variable is already in the variablesWithCorrespondingGroups
          // group, we push this to list, if not, we create a new entry for it
          variablesWithCorrespondingGroups[variableID]
            ? variablesWithCorrespondingGroups[variableID].push(variableGroup['@_ID'])
            : (variablesWithCorrespondingGroups[variableID] = [variableGroup['@_ID']]);
        });
      });
    }
    return variablesWithCorrespondingGroups;
  }
);
