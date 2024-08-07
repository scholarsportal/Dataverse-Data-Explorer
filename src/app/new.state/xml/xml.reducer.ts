import { MatchVariables, XmlState } from './xml.interface';
import { createReducer, on } from '@ngrx/store';
import { DataverseFetchActions, XmlManipulationActions } from './xml.actions';
import {
  changeGroupsForMultipleVariables,
  changeGroupsForSingleVariable,
  changeMultipleVariables,
  changeMultipleVariableWeights,
  changeSingleVariable,
  createNewVariables,
  deleteVariableGroup,
  extractUrlAndToken,
  matchVariableIDs,
  removeVariablesFromGroups,
  renameVariableGroup,
  updateGroups,
} from './xml.util';

export const initialState: XmlState = {
  dataset: null,
  info: null,
  header: null,
};

export const xmlReducer = createReducer(
  initialState,
  on(
    DataverseFetchActions.decodeAndFetchDDISuccess,
    (state, { data, apiResponse }) => {
      let info: {
        siteURL?: string;
        apiKey: string | null;
        fileID: number;
        secureUploadUrl: string | null;
      } = {
        apiKey: null,
        fileID: apiResponse.data.queryParameters.fileId,
        secureUploadUrl: null,
      };
      const extractedData = extractUrlAndToken(
        apiResponse.data.signedUrls[0].signedUrl,
      );
      if (extractedData) {
        info = {
          ...info,
          siteURL: extractedData.siteURL,
          apiKey: extractedData.apiKey ? extractedData.apiKey : null,
          secureUploadUrl: apiResponse.data.signedUrls[1]?.signedUrl || null,
        };
      }
      return {
        ...state,
        dataset: data,
        info,
        header: {
          citation: data.codeBook.stdyDscr?.citation.biblCit,
          title: data.codeBook.stdyDscr?.citation.titlStmt.titl,
        },
      };
    },
  ),
  on(
    DataverseFetchActions.fetchDDISuccess,
    (state, { data, fileID, siteURL, apiKey }) => {
      return {
        ...state,
        dataset: data,
        info: {
          siteURL,
          apiKey: apiKey ? apiKey : null,
          fileID,
          secureUploadUrl: null,
        },
        header: {
          citation: data.codeBook.stdyDscr?.citation.biblCit,
          title: data.codeBook.stdyDscr?.citation.titlStmt.titl,
        },
      };
    },
  ),
  on(
    XmlManipulationActions.importConversionSuccess,
    (state, { importDdiData, variableTemplate }) => {
      const duplicateState: XmlState = structuredClone(state);
      const variables = duplicateState.dataset?.codeBook.dataDscr.var || [];
      const variableGroups =
        duplicateState.dataset?.codeBook.dataDscr.varGrp || [];
      if (duplicateState.dataset && variables.length) {
        const variablesMatched: MatchVariables = matchVariableIDs(
          importDdiData.codeBook.dataDscr.var,
          variables,
        );
        duplicateState.dataset.codeBook.dataDscr.var = createNewVariables(
          variablesMatched,
          variables,
          variableTemplate,
        );
        if (variableTemplate.groups) {
          duplicateState.dataset.codeBook.dataDscr.varGrp = updateGroups(
            importDdiData.codeBook.dataDscr.varGrp,
          );
        }
        // console.log(createNewVariables(variablesMatched, variables, variableTemplate));
        duplicateState.info
          ? (duplicateState.info.importedSuccess = true)
          : {
              siteURL: '',
              fileID: '',
              apiKey: '',
              importedSuccess: true,
            };
      }
      return {
        ...duplicateState,
      };
    },
  ),
  on(XmlManipulationActions.renameGroup, (state, { groupID, newLabel }) => {
    let duplicateVariableGroups = structuredClone(
      state.dataset?.codeBook.dataDscr.varGrp || [],
    );
    duplicateVariableGroups = renameVariableGroup(
      duplicateVariableGroups,
      groupID,
      newLabel,
    );
    return {
      ...state,
      dataset: !state.dataset
        ? null
        : {
            ...state.dataset,
            codeBook: {
              ...state.dataset?.codeBook,
              dataDscr: {
                ...state.dataset?.codeBook.dataDscr,
                varGrp: duplicateVariableGroups,
              },
            },
          },
    };
  }),
  on(XmlManipulationActions.deleteGroup, (state, { groupID }) => {
    let duplicateVariableGroups = structuredClone(
      state.dataset?.codeBook.dataDscr.varGrp || [],
    );
    duplicateVariableGroups = deleteVariableGroup(
      duplicateVariableGroups,
      groupID,
    );
    return {
      ...state,
      dataset: !state.dataset
        ? null
        : {
            ...state.dataset,
            codeBook: {
              ...state.dataset?.codeBook,
              dataDscr: {
                ...state.dataset?.codeBook.dataDscr,
                varGrp: duplicateVariableGroups,
              },
            },
          },
    };
  }),
  on(XmlManipulationActions.createGroup, (state, { groupID, label }) => {
    let duplicateVariableGroups = structuredClone(
      state.dataset?.codeBook.dataDscr.varGrp || [],
    );
    duplicateVariableGroups.push({
      '@_ID': groupID,
      labl: label,
      '@_var': '',
    });
    return {
      ...state,
      dataset: !state.dataset
        ? null
        : {
            ...state.dataset,
            codeBook: {
              ...state.dataset?.codeBook,
              dataDscr: {
                ...state.dataset?.codeBook.dataDscr,
                varGrp: duplicateVariableGroups,
              },
            },
          },
    };
  }),
  on(
    XmlManipulationActions.removeVariablesFromGroup,
    (state, { groupID, variableIDs }) => {
      const duplicateVariableGroups = structuredClone(
        state.dataset?.codeBook.dataDscr.varGrp || [],
      );
      const patchedVariableGroups = removeVariablesFromGroups(
        groupID,
        variableIDs,
        duplicateVariableGroups,
      );
      return {
        ...state,
        dataset: !state.dataset
          ? null
          : {
              ...state.dataset,
              codeBook: {
                ...state.dataset?.codeBook,
                dataDscr: {
                  ...state.dataset?.codeBook.dataDscr,
                  varGrp: patchedVariableGroups,
                },
              },
            },
      };
    },
  ),
  on(
    XmlManipulationActions.saveVariableInfo,
    (state, { variableID, newVariableValue, groups }) => {
      let duplicateVariables = structuredClone(
        state.dataset?.codeBook.dataDscr.var || [],
      );
      let duplicateVariableGroups = structuredClone(
        state.dataset?.codeBook.dataDscr.varGrp || [],
      );
      if (Array.isArray(variableID)) {
      } else {
        duplicateVariables = changeSingleVariable(
          duplicateVariables,
          variableID,
          newVariableValue,
        );
        duplicateVariableGroups = changeGroupsForSingleVariable(
          duplicateVariableGroups,
          variableID,
          groups,
        );
      }
      return {
        ...state,
        dataset: !state.dataset
          ? null
          : {
              ...state.dataset,
              codeBook: {
                ...state.dataset?.codeBook,
                dataDscr: {
                  ...state.dataset?.codeBook.dataDscr,
                  var: duplicateVariables,
                  varGrp: duplicateVariableGroups,
                },
              },
            },
      };
    },
  ),
  on(
    XmlManipulationActions.bulkSaveVariableInfo,
    (state, { variableIDs, newVariableValue, groups, assignedWeight }) => {
      let duplicateVariables = structuredClone(
        state.dataset?.codeBook.dataDscr.var || [],
      );
      let duplicateVariableGroups = structuredClone(
        state.dataset?.codeBook.dataDscr.varGrp || [],
      );
      if (newVariableValue) {
        duplicateVariables = changeMultipleVariables(
          duplicateVariables,
          variableIDs,
          newVariableValue,
          assignedWeight,
        );
      }
      if (assignedWeight) {
        duplicateVariables = changeMultipleVariableWeights(
          duplicateVariables,
          variableIDs,
          assignedWeight === 'remove' ? '' : assignedWeight,
        );
      }
      if (groups) {
        duplicateVariableGroups = changeGroupsForMultipleVariables(
          duplicateVariableGroups,
          variableIDs,
          groups,
        );
      }
      return {
        ...state,
        dataset: !state.dataset
          ? null
          : {
              ...state.dataset,
              codeBook: {
                ...state.dataset?.codeBook,
                dataDscr: {
                  ...state.dataset?.codeBook.dataDscr,
                  var: duplicateVariables,
                  varGrp: duplicateVariableGroups,
                },
              },
            },
      };
    },
  ),
);
