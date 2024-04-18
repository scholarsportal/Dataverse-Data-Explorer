import { ddiJSONStructure } from './xml.interface';
import { createReducer, on } from '@ngrx/store';
import { DataverseFetchActions, XmlManipulationActions } from './xml.actions';

export const initialState: {
  dataset?: ddiJSONStructure,
  info?: {
    siteURL: string,
    fileID: number,
    apiKey?: string
  }
} = {};

export const xmlReducer = createReducer(
  initialState,
  on(DataverseFetchActions.fetchDDISuccess, (state, { data, fileID, apiKey, siteURL }) => {
    return {
      dataset: data,
      info: {
        siteURL,
        apiKey,
        fileID
      }
    };
  }),
  on(XmlManipulationActions.importConversionSuccess, (state, { importDdiData, variableTemplate }) => {
    const newState: { dataset?: ddiJSONStructure } = structuredClone(state);
    const variables = newState.dataset?.codeBook.dataDscr.var || [];
    const variableGroups = newState.dataset?.codeBook.dataDscr.varGrp || [];
    if (newState.dataset && variables.length && variableGroups.length) {
      // First match the incoming groups with the groups in the dataset
      // const groupMatched: MatchGroups = matchGroups(
      //   importDdiData.codeBook.dataDscr.varGrp,
      //   variableGroups
      // );
      // Then match the incoming variables with the variables in the dataset
      // const variablesMatched: MatchVariables = matchVariableIDs(
      //   importDdiData.codeBook.dataDscr.var,
      //   variables
      // );
      // Change the groups in the current dataset to match incoming
      // const newGroups: VariableGroup[] = createNewVarGroups(
      //   groupMatched,
      //   variablesMatched,
      //   variableGroups
      // );
      // Match variables metadata based on variableTemplate
      // const newVariables: { variables: Variable[]; count: number } =
      // createNewVariables(variablesMatched, variables, variableTemplate);
      // Change current dataset variables and groups
      // newState.dataset.codeBook.dataDscr.var = newVariables.variables;
      // newState.dataset.codeBook.dataDscr.varGrp = newGroups;
      // newState.import.rejected = variables.length - newVariables.count;
    }
    return {
      ...state
    };
  })
);
