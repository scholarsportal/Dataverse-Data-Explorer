import { MatchVariables, XmlState } from './xml.interface';
import { createReducer, on } from '@ngrx/store';
import { DataverseFetchActions, XmlManipulationActions } from './xml.actions';
import {
  changeGroupsForSingleVariable,
  changeSingleVariable,
  changeWeightForSelectedVariables,
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
  on(DataverseFetchActions.fetchDDIErrorAfter15Seconds, (state) => ({
    ...state,
    error: {
      type: 'chrome-error' as const,
      message: 'Dataset loading took too long',
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
      let variableGroups =
        duplicateState.dataset?.codeBook.dataDscr.varGrp || [];

      // Validate imported DDI structure before accessing
      const importedVariables = importDdiData?.codeBook?.dataDscr?.var;
      if (!duplicateState.dataset || !variables.length || !importedVariables) {
        return { ...duplicateState };
      }

      // Normalize single-element to array for fast-xml-parser
      const importedVariablesArray = Array.isArray(importedVariables)
        ? importedVariables
        : [importedVariables];

      const variablesMatched: MatchVariables = matchVariableIDs(
        importedVariablesArray,
        variables,
      );
      const { variables: updatedVariables, unmatchedWeights } =
        createNewVariables(variablesMatched, variables, variableTemplate);
      duplicateState.dataset.codeBook.dataDscr.var = updatedVariables;
      if (variableTemplate.groups) {
        const rawImportedGroups = importDdiData.codeBook.dataDscr.varGrp;
        if (rawImportedGroups) {
          const importedVariableGroups = Array.isArray(rawImportedGroups)
            ? rawImportedGroups
            : [rawImportedGroups];
          variableGroups = updateGroups(
            importedVariableGroups,
            variablesMatched,
            Array.isArray(variableGroups) ? variableGroups : [],
          );
          duplicateState.dataset.codeBook.dataDscr.varGrp = variableGroups;
        }
        // If the imported XML has no varGrp, leave existing groups untouched.
      }

      if (duplicateState.info) {
        duplicateState.info.importedSuccess = true;
        duplicateState.info.unmatchedImportedWeights = unmatchedWeights;
      } else {
        duplicateState.info = {
          secureUploadUrl: null,
          importedSuccess: true,
          unmatchedImportedWeights: unmatchedWeights,
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
    const newGroup = {
      '@_ID': groupID,
      labl: label,
    };

    if (Array.isArray(duplicateVariableGroups)) {
      duplicateVariableGroups.push(newGroup);
    } else if (duplicateVariableGroups) {
      duplicateVariableGroups = [duplicateVariableGroups, newGroup];
    } else {
      duplicateVariableGroups = [newGroup];
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
    XmlManipulationActions.bulkSaveWeightAndGroupChangeSuccess,
    (state, { updatedGroups, updatedVariables }) => {
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
                  var: updatedVariables,
                  varGrp: updatedGroups,
                },
              },
            },
      };
    },
  ),
  on(
    XmlManipulationActions.bulkSaveVariableModalSuccess,
    (state, { updatedVariables }) => {
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
                  var: updatedVariables,
                },
              },
            },
      };
    },
  ),
);
