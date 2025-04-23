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
    save: 'idle' | 'pending' | 'error' | 'success';
    download: 'idle' | 'pending' | 'error' | 'success';
    downloadErrorMessage?: string;
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
    save: 'idle',
    download: 'idle',
    upload: 'idle',
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
  on(DataverseFetchActions.fetchDDIError, (state, { error }) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        download: 'error' as const,
      },
    };
  }),
  on(DataverseFetchActions.fetchDDISuccess, (state, { crossTabData }) => ({
    ...state,
    crossTabulation: {
      ...state.crossTabulation,
      ...crossTabData,
    },
    operationStatus: {
      ...state.operationStatus,
      download: 'success' as const,
    },
  })),
  on(DataverseFetchActions.completeCrossTabFetch, (state, { crossTabData }) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        download: 'success' as const,
      },
      crossTabulation: {
        ...state.crossTabulation,
        ...crossTabData,
      },
    };
  }),
  on(DataverseFetchActions.startSecureDatasetUpload, (state) => ({
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
  on(DatasetActions.clearDatasetUploadStatus, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        upload: 'idle' as const,
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
  on(XmlManipulationActions.weightProcessStart, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        weightProcess: 'pending' as const,
      },
    };
  }),
  on(
    XmlManipulationActions.weightProcessSuccess,
    (state, { variablesWithCrossTabMetadata }) => {
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
  on(
    CrossTabulationUIActions.addWeightVariableToSelection,
    (state, { variableID, crossTabValues }) => {
      return {
        ...state,
        crossTabulation: {
          ...state.crossTabulation,
          ...crossTabValues,
        },
      };
    },
  ),
  on(DatasetActions.saveVariableStatusPending, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        save: 'pending' as const,
      },
    };
  }),
  on(DatasetActions.saveVariableStatusSuccess, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        save: 'success' as const,
      },
    };
  }),
  on(DatasetActions.clearVariableSaveStatus, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        save: 'idle' as const,
      },
    };
  }),
);
