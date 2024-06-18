import { XmlState } from './xml.interface';
import { createReducer, on } from '@ngrx/store';
import { DataverseFetchActions, XmlManipulationActions } from './xml.actions';
import {
  changeGroupsForMultipleVariables,
  changeGroupsForSingleVariable,
  changeMultipleVariables,
  changeMultipleVariableWeights,
  changeSingleVariable,
  deleteVariableGroup,
  removeVariablesFromGroups,
  renameVariableGroup
} from './xml.util';

export const initialState: XmlState = {
  dataset: null,
  info: null,
  header: null
};

export const xmlReducer = createReducer(
  initialState,
  on(
    DataverseFetchActions.fetchDDISuccess,
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
    }
  ),
  on(
    XmlManipulationActions.importConversionSuccess,
    (state, { importDdiData, variableTemplate }) => {
      const duplicateState: XmlState = structuredClone(state);
      const variables = duplicateState.dataset?.codeBook.dataDscr.var || [];
      const variableGroups =
        duplicateState.dataset?.codeBook.dataDscr.varGrp || [];
      if (duplicateState.dataset && variables.length && variableGroups.length) {
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
    }
  ),
  on(XmlManipulationActions.renameGroup, (state, { groupID, newLabel }) => {
    let duplicateVariableGroups = structuredClone(state.dataset?.codeBook.dataDscr.varGrp || []);
    duplicateVariableGroups = renameVariableGroup(duplicateVariableGroups, groupID, newLabel);
    return {
      ...state,
      dataset: !state.dataset ? null : {
        ...state.dataset,
        codeBook: {
          ...state.dataset?.codeBook,
          dataDscr: {
            ...state.dataset?.codeBook.dataDscr,
            varGrp: duplicateVariableGroups
          }
        }
      }
    };
  }),
  on(XmlManipulationActions.deleteGroup, (state, { groupID }) => {
    let duplicateVariableGroups = structuredClone(state.dataset?.codeBook.dataDscr.varGrp || []);
    duplicateVariableGroups = deleteVariableGroup(duplicateVariableGroups, groupID);
    return {
      ...state,
      dataset: !state.dataset ? null : {
        ...state.dataset,
        codeBook: {
          ...state.dataset?.codeBook,
          dataDscr: {
            ...state.dataset?.codeBook.dataDscr,
            varGrp: duplicateVariableGroups
          }
        }
      }
    };
  }),
  on(XmlManipulationActions.createGroup, (state, { groupID, label }) => {
    let duplicateVariableGroups = structuredClone(state.dataset?.codeBook.dataDscr.varGrp || []);
    duplicateVariableGroups.push({
      '@_ID': groupID,
      labl: label,
      '@_var': ''
    });
    return {
      ...state,
      dataset: !state.dataset ? null : {
        ...state.dataset,
        codeBook: {
          ...state.dataset?.codeBook,
          dataDscr: {
            ...state.dataset?.codeBook.dataDscr,
            varGrp: duplicateVariableGroups
          }
        }
      }
    };
  }),
  on(XmlManipulationActions.removeVariablesFromGroup, (state, { groupID, variableIDs }) => {
    const duplicateVariableGroups = structuredClone(state.dataset?.codeBook.dataDscr.varGrp || []);
    const patchedVariableGroups = removeVariablesFromGroups(groupID, variableIDs, duplicateVariableGroups);
    return {
      ...state,
      dataset: !state.dataset ? null : {
        ...state.dataset,
        codeBook: {
          ...state.dataset?.codeBook,
          dataDscr: {
            ...state.dataset?.codeBook.dataDscr,
            varGrp: patchedVariableGroups
          }
        }
      }
    };
  }),
  on(XmlManipulationActions.saveVariableInfo,
    (state, { variableID, newVariableValue, groups }) => {
      let duplicateVariables = structuredClone(state.dataset?.codeBook.dataDscr.var || []);
      let duplicateVariableGroups = structuredClone(state.dataset?.codeBook.dataDscr.varGrp || []);
      if (Array.isArray(variableID)) {
      } else {
        duplicateVariables = changeSingleVariable(duplicateVariables, variableID, newVariableValue);
        duplicateVariableGroups = changeGroupsForSingleVariable(duplicateVariableGroups, variableID, groups);
      }
      return {
        ...state,
        dataset: !state.dataset ? null : {
          ...state.dataset,
          codeBook: {
            ...state.dataset?.codeBook,
            dataDscr: {
              ...state.dataset?.codeBook.dataDscr,
              var: duplicateVariables,
              varGrp: duplicateVariableGroups
            }
          }
        }
      };
    }),
  on(XmlManipulationActions.bulkSaveVariableInfo,
    (state, { variableIDs, newVariableValue, groups, assignedWeight }) => {
      let duplicateVariables = structuredClone(state.dataset?.codeBook.dataDscr.var || []);
      let duplicateVariableGroups = structuredClone(state.dataset?.codeBook.dataDscr.varGrp || []);
      if (newVariableValue) {
        duplicateVariables = changeMultipleVariables(duplicateVariables, variableIDs, newVariableValue, assignedWeight);
      }
      if (assignedWeight) {
        duplicateVariables = changeMultipleVariableWeights(duplicateVariables, variableIDs, assignedWeight === 'remove' ? '' : assignedWeight);
      }
      if (groups) {
        duplicateVariableGroups = changeGroupsForMultipleVariables(duplicateVariableGroups, variableIDs, groups);
      }
      return {
        ...state,
        dataset: !state.dataset ? null : {
          ...state.dataset,
          codeBook: {
            ...state.dataset?.codeBook,
            dataDscr: {
              ...state.dataset?.codeBook.dataDscr,
              var: duplicateVariables,
              varGrp: duplicateVariableGroups
            }
          }
        }
      };
    })
);
