import { createReducer, on } from '@ngrx/store';
import {
  DataverseFetchActions,
  XmlManipulationActions,
} from '../xml/xml.actions';
import { DatasetActions } from './dataset.actions';
import {
  CrossTabulationUIActions,
  VariableTabUIAction,
} from '../ui/ui.actions';
import { ddiJSONStructure } from '../xml/xml.interface';

export interface DatasetState {
  operationStatus: {
    download: 'idle' | 'pending' | 'error' | 'success';
    downloadErrorMessage?: string;
    weightProcess: 'idle' | 'pending' | 'error' | 'success';
    weightProcessMessage?: string;
    upload: 'idle' | 'pending' | 'error' | 'success' | 'disabled';
    uploadErrorMessage?: string;
    variableDownload: 'idle' | 'pending' | 'error' | 'success';
    variableDownloadErrorMessage?: string;
    import: 'idle' | 'pending' | 'error' | 'success';
    importErrorMessage?: string;
    openVariableEdit: 'idle' | 'changes' | 'saved';
  };
  variables: {
    importedDataset: ddiJSONStructure | null;
    importedResult: string | null;
  };
  crossTabulation: {
    [variableID: string]: string[];
  };
  weightedFrequencies: {
    [variableID: string]: {
      [weightVariableID: string]: { [categoryID: string]: string };
    };
  };
}

const initialState: DatasetState = {
  operationStatus: {
    download: 'idle',
    upload: 'idle',
    weightProcess: 'idle',
    variableDownload: 'idle',
    import: 'idle',
    openVariableEdit: 'idle',
  },
  variables: {
    importedDataset: null,
    importedResult: null,
  },
  crossTabulation: {},
  weightedFrequencies: {},
};

export const datasetReducer = createReducer(
  initialState,
  on(DataverseFetchActions.fetchDDIStart, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        download: 'pending' as const,
      },
    };
  }),
  on(DataverseFetchActions.decodeURLAndFetch, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        download: 'pending' as const,
      },
    };
  }),
  on(DataverseFetchActions.decodeAndFetchDDISuccess, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        download: 'success' as const,
      },
    };
  }),
  on(DataverseFetchActions.fetchDDIError, (state, { error }) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        download: 'error' as const,
      },
    };
  }),
  on(DataverseFetchActions.fetchDDISuccess, (state) => ({
    ...state,
    operationStatus: {
      ...state.operationStatus,
      download: 'success' as const,
    },
  })),
  on(DataverseFetchActions.weightsFetchSuccess, (state, { data }) => {
    return {
      ...state,
      crossTabulation: {
        ...state.crossTabulation,
        ...data,
      },
    };
  }),
  on(DataverseFetchActions.datasetUploadStart, (state) => ({
    ...state,
    operationStatus: {
      ...state.operationStatus,
      upload: 'pending' as const,
    },
  })),
  on(DataverseFetchActions.datasetUploadSuccess, (state, data) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        upload: 'success' as const,
      },
    };
  }),
  on(DataverseFetchActions.datasetUploadError, (state, { error }) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        upload: 'error' as const,
      },
    };
  }),
  on(DatasetActions.updateCrossTabValues, (state, { data, variableID }) => {
    return {
      ...state,
      crossTabulation: {
        ...state.crossTabulation,
        [variableID]: data[variableID],
      },
      operationStatus: {
        ...state.operationStatus,
        variableDownload: 'success' as const,
      },
    };
  }),
  on(CrossTabulationUIActions.fetchCrossTabAndAddToSelection, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        variableDownload: 'pending' as const,
      },
    };
  }),
  on(VariableTabUIAction.changeOpenVariable, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        openVariableEdit: 'idle' as const,
      },
    };
  }),
  on(
    CrossTabulationUIActions.fetchCrossTabAndChangeValueInGivenIndex,
    (state) => {
      return {
        ...state,
        operationStatus: {
          ...state.operationStatus,
          variableDownload: 'pending' as const,
        },
      };
    },
  ),
  on(XmlManipulationActions.startImportMetadata, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        import: 'pending' as const,
      },
    };
  }),
  on(XmlManipulationActions.importConversionSuccess, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        import: 'success' as const,
      },
    };
  }),
  on(XmlManipulationActions.importConversionError, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        import: 'error' as const,
      },
    };
  }),
  on(XmlManipulationActions.resetImport, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        import: 'idle' as const,
      },
    };
  }),
  on(
    XmlManipulationActions.weightProcessStart,
    XmlManipulationActions.weightProcessFetchMissingValuesAndStart,
    (state) => {
      return {
        ...state,
        operationStatus: {
          ...state.operationStatus,
          weightProcess: 'pending' as const,
        },
      };
    },
  ),
  on(
    XmlManipulationActions.weightProcessSuccess,
    (state, { variablesWithCrossTabMetadata }) => {
      console.log(variablesWithCrossTabMetadata);
      return {
        ...state,
        operationStatus: {
          ...state.operationStatus,
          weightProcess: 'success' as const,
        },
        crossTabulation: {
          ...state.crossTabulation,
          ...variablesWithCrossTabMetadata,
        },
      };
    },
  ),
);
