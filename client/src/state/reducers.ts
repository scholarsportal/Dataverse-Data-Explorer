import { createReducer, on } from '@ngrx/store';
import * as Actions from './actions';

export interface GraphObject {
  [id: string]: {
    weighted: { label: string; frequency: number }[];
    unweighted: { label: string; frequency: number }[];
  }
}

export interface State {
  dataset: {
    status: string;
    data: any;
    error: any;
  };
  openVariable: {
    editing: boolean;
    variable: any;
    graph: any;
    previouslyOpen: GraphObject;
  };
  upload: {
    status: string;
    error: any;
  };
  variables: any[];
  groups: any[];
}

const initialState: State = {
  dataset: {
    status: '',
    data: null,
    error: null,
  },
  openVariable: {
    editing: false,
    variable: null,
    graph: null,
    previouslyOpen: {}
  },
  upload: {
    status: '',
    error: null,
  },
  variables: [],
  groups: [],
};

export const reducer = createReducer(
  initialState,
  on(Actions.fetchDataset, (state) => ({ ...state, dataset: { status: 'pending', data: null, error: null } })),
  on(Actions.datasetLoadPending, (state) => ({ ...state, dataset: { ...state.dataset, status: 'pending' } })),
  on(Actions.datasetLoadSuccess, (state, { data }) => ({ ...state, dataset: { status: 'success', data, error: null } })),
  on(Actions.variableViewChart, (state, { variable }) => ({ ...state, openVariable: { ...state.openVariable, editing: false, variable: variable } })),
  on(Actions.variableViewDetail, (state, { variable }) => ({ ...state, openVariable: { ...state.openVariable, editing: true, variable: variable } })),
  on(Actions.variableCreateGraphSuccess, (state, { id, weighted, unweighted }) =>
  ({
    ...state, openVariable: {
      ...state.openVariable, graph: {weighted, unweighted}, previouslyOpen: {
        ...state.openVariable.previouslyOpen,
        [id]: { weighted, unweighted }
      }
    }
  }
  )),
  on(Actions.variableCreateGraphError, (state, {error}) =>
  ({
    ...state, openVariable: {
      ...state.openVariable, graph: null
    }
  }
  )),
  // on(Actions.datasetLoadError, (state, { error }) => ({ ...state, dataset: { status: 'error', data: null, error } })),
  // on(Actions.datasetUploadRequest, (state) => ({ ...state, upload: { status: 'pending', error: null } })),
  // on(Actions.datasetUploadPending, (state) => ({ ...state, upload: { status: 'pending', error: null } })),
  // on(Actions.datasetUploadSuccess, (state) => ({ ...state, upload: { status: 'success', error: null } })),
  // on(Actions.datasetUploadError, (state, { error }) => ({ ...state, upload: { status: 'error', error } })),
  // on(Actions.datasetDownload, (state) => state), // No state change needed for download
  // on(Actions.datasetLocalSave, (state) => state), // No state change needed for local save
  // on(Actions.variableChangeDetail, (state, { variable }) => ({ ...state, variables: [...state.variables], upload: { status: '', error: null } })),
  // on(Actions.variableAddToSelectedGroup, (state, { variable }) => ({ ...state, variables: [...state.variables], upload: { status: '', error: null } })),
  //   on(Actions.groupCreateNew, (state) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } }))),
  // on(Actions.groupRemove, (state, { groupId }) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } })),
  // on(Actions.groupChangeName, (state, { groupId, newName }) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } })),
  // on(Actions.groupAddSelectedGroup, (state, { groupId }) => ({ ...state, groups: [...state.groups], upload: { status: '', error: null } }),
);

export function appReducer(state: State | undefined, action: any) {
  return reducer(state, action);
}
