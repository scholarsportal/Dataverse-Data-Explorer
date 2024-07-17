import { ddiJSONStructure } from '../../old.state/interface';
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

export interface DatasetState {
  operationStatus: {
    download: 'idle' | 'pending' | 'error' | 'success';
    upload: 'idle' | 'pending' | 'error' | 'success' | 'disabled';
    variableDownload: 'idle' | 'pending' | 'error' | 'success';
    import: 'idle' | 'pending' | 'error' | 'success';
    openVariableEdit: 'idle' | 'changes' | 'saved';
  };
  variables: {
    importedDataset: ddiJSONStructure | null;
    importedResult: string | null;
  };
  crossTabulation: {
    [variableID: string]: string[];
  };
}

const initialState: DatasetState = {
  operationStatus: {
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
};

export const datasetReducer = createReducer(
  initialState,
  on(DataverseFetchActions.startDDIFetch, (state) => {
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
  on(DataverseFetchActions.fetchDDISuccess, (state) => ({
    ...state,
    operationStatus: {
      ...state.operationStatus,
      download: 'success' as const,
    },
  })),
  on(DatasetActions.updateCrossTabValues, (state, { data, variableID }) => {
    return {
      ...state,
      crossTabulation: {
        ...state.crossTabulation,
        [variableID]: data,
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
  on(DatasetActions.updateCrossTabValues, (state) => {
    return {
      ...state,
      operationStatus: {
        ...state.operationStatus,
        variableDownload: 'success' as const,
      },
    };
  }),
  on(DataverseFetchActions.startDatasetUpload, (state) => ({
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
);
