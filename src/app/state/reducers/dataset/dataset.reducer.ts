import { createReducer, on } from '@ngrx/store';
import * as DatasetActions from '../../actions/dataset.actions';
import * as VarAndGroups from '../../actions/var-and-groups.actions';
import { JSONStructure, Variable, VariableGroup } from '../../interface';
import {
  MatchGroups,
  MatchVariables,
  createNewVarGroups,
  createNewVariables,
  matchGroups,
  matchVariableIDs,
} from './dataset-reducer.utils';

export interface DatasetState {
  dataset: JSONStructure | null;
  datasetInfo: {
    fileID: null | number;
    siteURL: string | null;
    apiKey: string | undefined;
  };
  download: {
    status: 'idle' | 'pending' | 'converting' | 'error' | 'success';
  };
  upload: {
    status: 'idle' | 'pending' | 'converting' | 'error' | 'success';
  };
  import: {
    changed: number | null;
    rejected: number | null;
    status: 'idle' | 'pending' | 'converting' | 'error' | 'success';
  };
  errorMessage?: string | unknown;
}

export const initialState: DatasetState = {
  dataset: null,
  datasetInfo: {
    fileID: null,
    siteURL: null,
    apiKey: undefined,
  },
  download: {
    status: 'idle',
  },
  upload: {
    status: 'idle',
  },
  import: {
    status: 'idle',
    changed: null,
    rejected: null,
  },
};

export const datasetReducer = createReducer(
  initialState,
  on(
    DatasetActions.fetchDataset,
    (state): DatasetState => ({
      ...state,
      download: {
        status: 'pending' as const,
      },
    }),
  ),
  on(
    DatasetActions.setDataset,
    (state, { dataset }): DatasetState => ({
      ...state,
      dataset,
      download: {
        status: 'success' as const,
      },
    }),
  ),
  on(
    DatasetActions.fetchDatasetError,
    (state, { error }): DatasetState => ({
      ...state,
      download: {
        status: 'error' as const,
      },
      errorMessage: error,
    }),
  ),
  on(
    DatasetActions.datasetConversionPending,
    (state): DatasetState => ({
      ...state,
      download: {
        status: 'converting' as const,
      },
    }),
  ),
  on(
    DatasetActions.datasetConversionSuccess,
    (state, { dataset, siteURL, fileID, apiKey }): DatasetState => ({
      ...state,
      dataset,
      datasetInfo: {
        siteURL,
        fileID,
        apiKey,
      },
      download: {
        status: 'success' as const,
      },
    }),
  ),
  on(
    DatasetActions.datasetConversionError,
    (state, { error }): DatasetState => ({
      ...state,
      download: {
        status: 'error' as const,
      },
      errorMessage: error,
    }),
  ),
  on(DatasetActions.saveVariable, (state, { variableID, variable, groups }) => {
    const newState = JSON.parse(JSON.stringify(state));
    if (newState) {
      const variables = newState.dataset?.codeBook.dataDscr.var || [];
      const varGroups: VariableGroup[] =
        newState.dataset?.codeBook.dataDscr.varGrp || [];
      for (let index = 0; index < variables.length; index++) {
        if (variables[index]['@_ID'] === variableID) {
          variables[index].labl['#text'] = variable.label;
          variables[index]['qstn'] = {
            ivuInstr: variable.interviewQuestion ?? '',
            postQTxt: variable.postQuestion ?? '',
            qstnLit: variable.literalQuestion,
          };
          variables[index].universe = variable.universe ?? '';
          variables[index].notes = {
            ...variables[index].notes,
            '#text': variable.notes ?? '',
          };
          variable.isWeight
            ? (variables[index]['@_wgt'] = 'wgt')
            : (variables[index]['@_wgt'] = null);
          variables[index]['@_wgt-var'] =
            (variables[index]['@_wgt'] ? '' : variable.weight) ?? '';
          break;
        }
      }
      for (let index = 0; index < varGroups.length; index++) {
        const variablesInGroup = varGroups[index]['@_var'].split(' ');
        const variableIndex = variablesInGroup.indexOf(variableID);
        // if current var group includes current id AND is not in the new group selected
        if (
          variableIndex !== -1 &&
          variablesInGroup.includes(variableID) &&
          !groups.includes(varGroups[index]['@_ID'])
        ) {
          variablesInGroup.splice(variableIndex, 1);
        }
        if (
          !variablesInGroup.includes(variableID) &&
          groups.includes(varGroups[index]['@_ID'])
        ) {
          variablesInGroup.push(variableID);
        }
        varGroups[index]['@_var'] = variablesInGroup.join(' ');
      }
    }
    return { ...newState };
  }),
  on(VarAndGroups.groupCreateNew, (state, { groupID, label }) => {
    const newState: DatasetState = JSON.parse(JSON.stringify(state));
    if (newState) {
      newState.dataset?.codeBook?.dataDscr?.varGrp?.push({
        '@_ID': groupID,
        labl: label,
        '@_var': '',
      });
    }
    return {
      ...newState,
    };
  }),
  on(
    VarAndGroups.removeSelectedVariablesFromGroup,
    (state, { variableIDs, groupID }) => {
      const newState = JSON.parse(JSON.stringify(state));
      const arr: VariableGroup[] =
        newState.dataset?.codeBook.dataDscr.varGrp || [];
      for (let index = 0; index < arr.length; index++) {
        const group = arr[index];
        if (group['@_ID'] === groupID) {
          const variables = group['@_var'].split(' ');
          group['@_var'] = variables
            .filter((variable) => !variableIDs.includes(variable))
            .join(' ');
        }
      }
      return {
        ...newState,
      };
    },
  ),
  on(VarAndGroups.groupDelete, (state, { groupID }) => {
    const newState: DatasetState = JSON.parse(JSON.stringify(state));
    if (newState) {
      const arr = newState.dataset?.codeBook.dataDscr.varGrp || [];
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (element['@_ID'] === groupID) {
          arr.splice(index, 1);
          break;
        }
      }
    }
    return {
      ...newState,
    };
  }),
  on(VarAndGroups.groupChangeName, (state, { groupID, newName }) => {
    const newState: DatasetState = JSON.parse(JSON.stringify(state));
    if (newState) {
      const arr = newState.dataset?.codeBook.dataDscr.varGrp || [];
      for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        if (element['@_ID'] === groupID) {
          element.labl = newName;
        }
      }
    }
    return {
      ...newState,
    };
  }),
  on(VarAndGroups.bulkEditVariables, (state, { variables }) => {
    const newState: DatasetState = JSON.parse(JSON.stringify(state));
    const variableArray = newState.dataset?.codeBook.dataDscr.var || [];
    const variableIDs = Object.keys(variables);
    for (let index = 0; index < variableArray.length; index++) {
      const element = variableArray[index];
      if (variableIDs.includes(element['@_ID'])) {
        variableArray[index] = variables[element['@_ID']];
      }
    }
    return {
      ...newState,
    };
  }),
  on(VarAndGroups.bulkChangeGroupsAndWeight, (state, { groups, variables }) => {
    const newState = JSON.parse(JSON.stringify(state));
    const groupArray = newState.dataset?.codeBook.dataDscr.varGrp || [];
    const variableArray = newState.dataset?.codeBook.dataDscr.var || [];
    for (let index = 0; index < groupArray.length; index++) {
      const element = groupArray[index];
      if (Object.keys(groups).includes(element['@_ID'])) {
        element['@_var'] = groups[element['@_ID']]['@_var'];
      }
    }
    for (let index = 0; index < variableArray.length; index++) {
      const element = variableArray[index];
      if (Object.keys(variables).includes(element['@_ID'])) {
        variableArray[index] = variables[element['@_ID']];
      }
    }
    return {
      ...newState,
    };
  }),
  on(DatasetActions.datasetUploadSuccess, (state) => ({
    ...state,
    uploadStatus: {
      success: 'Upload success',
    },
  })),
  on(DatasetActions.datasetUploadFailed, (state, { error }) => ({
    ...state,
    uploadStatus: {
      error,
    },
  })),
  on(DatasetActions.datasetImportMetadataStart, (state) => {
    return {
      ...state,
      import: {
        ...state.import,
        status: 'pending' as const,
      },
    };
  }),
  on(
    DatasetActions.metadataImportConversionSuccess,
    (state, { dataset, variableTemplate }) => {
      const newState: DatasetState = JSON.parse(JSON.stringify(state));
      const variables = newState.dataset?.codeBook.dataDscr.var || [];
      const variableGroups = newState.dataset?.codeBook.dataDscr.varGrp || [];
      if (newState.dataset && variables.length && variableGroups.length) {
        const groupMatched: MatchGroups = matchGroups(
          dataset.codeBook.dataDscr.varGrp,
          variableGroups,
        );
        const variablesMatched: MatchVariables = matchVariableIDs(
          dataset.codeBook.dataDscr.var,
          variables,
        );
        const newGroups: VariableGroup[] = createNewVarGroups(
          groupMatched,
          variablesMatched,
          variableGroups,
        );
        const newVariables: { variables: Variable[]; count: number } =
          createNewVariables(variablesMatched, variables, variableTemplate);
        newState.dataset.codeBook.dataDscr.var = newVariables.variables;
        newState.dataset.codeBook.dataDscr.varGrp = newGroups;
        newState.import.status = 'success';
        newState.import.changed = newVariables.count;
        newState.import.rejected = variables.length - newVariables.count;
      }
      return {
        ...newState,
      };
    },
  ),
);
