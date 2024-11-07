import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Variable, VariableGroup, XmlState } from './xml.interface';

export const selectXmlFeature = createFeatureSelector<XmlState>('xml');

export const selectDatasetState = createSelector(
  selectXmlFeature,
  (state) => state,
);

export const selectDatasetError = createSelector(
  selectXmlFeature,
  (state) => state.error,
);

export const selectDatasetHasApiKey = createSelector(
  selectXmlFeature,
  (state) => !!state.info?.apiKey,
);

export const selectDatasetInfo = createSelector(
  selectXmlFeature,
  (state) => state.info,
);

export const selectDatasetCitationData = createSelector(
  selectXmlFeature,
  (state) => state.header,
);

export const selectDatasetTitle = createSelector(
  selectDatasetCitationData,
  (citationData) => {
    if (citationData) {
      return citationData.title;
    }
    return null;
  },
);

export const selectDatasetDoi = createSelector(
  selectXmlFeature,
  (xml) =>
    xml.dataset?.codeBook.stdyDscr.citation.titlStmt.IDNo['#text'] ?? null,
);

export const selectDatasetCitation = createSelector(
  selectDatasetCitationData,
  (citationData) => {
    if (citationData) {
      return citationData.citation;
    }
    return null;
  },
);

export const selectDatasetVariables = createSelector(
  selectXmlFeature,
  (state): Variable[] => {
    return state.dataset?.codeBook.dataDscr?.var ?? [];
  },
);

export const selectDatasetProcessedVariables = createSelector(
  selectDatasetVariables,
  (variables) => {
    const processedVariables: { [variableID: string]: Variable } = {};
    variables?.forEach((variable) => {
      processedVariables[variable['@_ID']] = variable;
    });
    return processedVariables;
  },
);

export const selectDatasetVariableGroups = createSelector(
  selectXmlFeature,
  (state): VariableGroup[] => state.dataset?.codeBook.dataDscr.varGrp ?? [],
);

export const selectDatasetProcessedGroups = createSelector(
  selectDatasetVariableGroups,
  (groups) => {
    const processedGroups: { [groupID: string]: VariableGroup } = {};
    groups?.forEach((group) => {
      processedGroups[group['@_ID']] = group;
    });
    return processedGroups;
  },
);

export const selectVariablesWithCorrespondingGroups = createSelector(
  selectDatasetVariables,
  selectDatasetVariableGroups,
  (variables, groups) => {
    const variablesWithCorrespondingGroups: {
      [variableID: string]: string[];
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
            ? variablesWithCorrespondingGroups[variableID].push(
                variableGroup['@_ID'],
              )
            : (variablesWithCorrespondingGroups[variableID] = [
                variableGroup['@_ID'],
              ]);
        });
      });
    }
    return variablesWithCorrespondingGroups;
  },
);
