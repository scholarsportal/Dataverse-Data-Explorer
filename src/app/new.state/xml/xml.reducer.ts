import { MatchVariables, XmlState } from './xml.interface';
import { createReducer, on } from '@ngrx/store';
import { DataverseFetchActions, XmlManipulationActions } from './xml.actions';
import {
  changeGroupsForMultipleVariables,
  changeGroupsForSingleVariable,
  partiallyChangeMultipleVariables,
  fullyChangeMultipleVariables,
  changeSingleVariable,
  createNewVariables,
  deleteVariableGroup,
  extractUrlAndToken,
  matchVariableIDs,
  removeVariablesFromGroups,
  renameVariableGroup,
  updateGroups,
} from './xml.util';
import { changeWeightForSelectedVariables } from '../dataset/util';

export const initialState: XmlState = {
  dataset: null,
  info: null,
  header: null,
  error: {
    type: null,
    message: null,
  },
};

export const xmlReducer = createReducer(
  initialState,
  on(
    DataverseFetchActions.completeCrossTabFetch,
    (state, { ddiData, apiResponse, language }) => {
      let info: {
        siteURL?: string;
        apiKey: string | null;
        language?: string;
        fileID: number;
        secureUploadUrl: string | null;
      } = {
        apiKey: null,
        fileID: apiResponse.data.queryParameters.fileId,
        language,
        secureUploadUrl: null,
      };

      const extractedData = extractUrlAndToken(
        apiResponse.data.signedUrls.find(
          (url) => url.name === 'retrieveDataFileDDI',
        )?.signedUrl || '',
      );
      if (extractedData) {
        info = {
          ...info,
          siteURL: extractedData.siteURL,
          apiKey: extractedData.apiKey ? extractedData.apiKey : null,
          secureUploadUrl:
            apiResponse.data.signedUrls.find(
              (url) => url.name === 'uploadDataFile',
            )?.signedUrl || null,
        };
      }
      return {
        ...state,
        dataset: ddiData,
        info,
        header: {
          citation: ddiData?.codeBook?.stdyDscr?.citation?.biblCit,
          title: ddiData?.codeBook?.stdyDscr?.citation?.titlStmt?.titl,
        },
      };
    },
  ),
  on(DataverseFetchActions.fetchDDIError, (state, { error }) => ({
    ...state,
    error: {
      type: 'fetch' as const,
      message: error.message || 'An error occurred while fetching the dataset',
    },
  })),
  on(DataverseFetchActions.datasetUploadError, (state, { error }) => ({
    ...state,
    error: {
      type: 'upload' as const,
      message: error.message || 'An error occurred while uploading the dataset',
    },
  })),
  on(
    DataverseFetchActions.fetchDDISuccess,
    (state, { data, fileID, siteURL }) => {
      return {
        ...state,
        dataset: data,
        info: {
          siteURL,
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
            variablesMatched,
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
    const duplicateVariableGroups = structuredClone(
      state.dataset?.codeBook.dataDscr.varGrp || [],
    );
    duplicateVariableGroups.push({
      '@_ID': groupID,
      labl: label,
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
    (
      state,
      {
        allVariables,
        variableID,
        newVariableValue,
        groups,
        variablesWithCrossTabMetadata,
      },
    ) => {
      let duplicateVariables = structuredClone(
        state.dataset?.codeBook.dataDscr.var || [],
      );
      let duplicateVariableGroups = structuredClone(
        state.dataset?.codeBook.dataDscr.varGrp || [],
      );
      if (!Array.isArray(variableID)) {
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
      const variablesObject = Object.fromEntries(
        duplicateVariables.map((variable) => [variable['@_ID'], variable]),
      );
      const weightsUpdatedVariableArray = changeWeightForSelectedVariables(
        variablesObject,
        [variableID],
        newVariableValue.assignedWeight,
        variablesWithCrossTabMetadata,
      );
      duplicateVariables = weightsUpdatedVariableArray;
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
    (
      state,
      {
        variableIDs,
        newVariableValue,
        groups,
        assignedWeight,
        variablesWithCrossTabMetadata,
      },
    ) => {
      let duplicateVariables = structuredClone(
        state.dataset?.codeBook.dataDscr.var || [],
      );
      let duplicateVariableGroups = structuredClone(
        state.dataset?.codeBook.dataDscr.varGrp || [],
      );
      if (newVariableValue) {
        duplicateVariables = partiallyChangeMultipleVariables(
          duplicateVariables,
          variableIDs,
          newVariableValue,
          assignedWeight,
        );
      }
      if (assignedWeight) {
        duplicateVariables = fullyChangeMultipleVariables(
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
      const variablesObject = Object.fromEntries(
        duplicateVariables.map((variable) => [variable['@_ID'], variable]),
      );
      const weightsUpdatedVariableArray = changeWeightForSelectedVariables(
        variablesObject,
        variableIDs,
        assignedWeight || '',
        variablesWithCrossTabMetadata,
      );
      duplicateVariables = weightsUpdatedVariableArray;
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
  // on(
  //   XmlManipulationActions.weightProcessSuccess,
  //   (
  //     state,
  //     { selectedVariables, allVariables, variablesWithCrossTabMetadata },
  //   ) => {
  //     const duplicateVariables =
  //       structuredClone(state.dataset?.codeBook.dataDscr.var) || [];
  //     if (duplicateVariables) {
  //       duplicateVariables.forEach((variable) => {
  //         if (selectedVariables.includes(variable['@_ID'])) {
  //           variable.catgry = allVariables[variable['@_ID']].catgry;
  //         }
  //       });
  //     }
  //     return {
  //       ...state,
  //       dataset: !state.dataset
  //         ? null
  //         : {
  //             ...state.dataset,
  //             codeBook: {
  //               ...state.dataset?.codeBook,
  //               dataDscr: {
  //                 ...state.dataset?.codeBook.dataDscr,
  //                 var: duplicateVariables,
  //               },
  //             },
  //           },
  //     };
  //   },
  // ),
);
