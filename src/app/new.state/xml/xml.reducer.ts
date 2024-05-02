import { XmlState } from './xml.interface';
import { createReducer, on } from '@ngrx/store';
import { DataverseFetchActions, XmlManipulationActions } from './xml.actions';

export const initialState: XmlState = {
  dataset: null,
  info: null,
  header: null
};

export const xmlReducer = createReducer(
  initialState,
  on(DataverseFetchActions.fetchDDISuccess,
    (state, { data, fileID, siteURL, apiKey }) => {
      return {
        dataset: data,
        info: {
          siteURL,
          apiKey,
          fileID
        },
        header: {
          citation: data.codeBook.stdyDscr.citation.biblCit,
          title: data.codeBook.stdyDscr.citation.titlStmt.titl
        }
      };
    }),
  on(XmlManipulationActions.importConversionSuccess, (state, { importDdiData, variableTemplate }) => {
    const newState: XmlState = structuredClone(state);
    const variables = newState.dataset?.codeBook.dataDscr.var || [];
    const variableGroups = newState.dataset?.codeBook.dataDscr.varGrp || [];
    if (newState.dataset && variables.length && variableGroups.length) {
      // First match the incoming groups with the groups in the dataset
      // const groupMatched: MatchGroups = matchGroups(
      //   importDdiData.codeBook.dataDscr.varGrp,
      //   variableGroups
      // );
      // Then match the incoming variables with the variables in the datas
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
