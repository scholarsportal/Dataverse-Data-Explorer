import { createReducer, on } from '@ngrx/store';
import {
  changeOpenVariable,
  changeVariableModalMode,
  closeOptionsMenu,
  closeVariableModal,
  openOptionsMenu,
  openVariableChartModal,
  openVariableEditModal,
} from '../actions/ui.actions';
import { changeSelectedGroup } from '../actions/var-and-groups.actions';

export interface OpenVariableState {
  modal: {
    open: boolean;
    mode: null | 'options' | 'view' | 'edit';
    variableID: string | null;
  };
}

export const initialState: OpenVariableState = {
  modal: {
    open: false,
    mode: null,
    variableID: null,
  },
};

export const openVariableReducer = createReducer(
  initialState,
  on(
    openOptionsMenu,
    (state): OpenVariableState => ({
      ...state,
      modal: {
        open: true,
        mode: 'options' as const,
        variableID: null,
      },
    }),
  ),
  on(
    closeOptionsMenu,
    (state): OpenVariableState => ({
      ...state,
      modal: {
        open: false,
        mode: null,
        variableID: null,
      },
    }),
  ),
  on(openVariableEditModal, (state, { variableID }) => ({
    ...state,
    modal: {
      open: true,
      mode: 'edit' as const,
      variableID,
    },
  })),
  on(openVariableChartModal, (state, { variableID }) => ({
    ...state,
    modal: {
      open: true,
      mode: 'view' as const,
      variableID,
    },
  })),
  on(closeVariableModal, (state) => ({
    ...state,
    modal: {
      open: false,
      mode: null,
      variableID: null,
    },
  })),
  on(changeVariableModalMode, (state, { modalMode }) => ({
    ...state,
    modal: {
      ...state.modal,
      mode: modalMode,
    },
  })),
  on(changeOpenVariable, (state, { variableID }) => ({
    ...state,
    modal: {
      mode: state.modal.mode,
      open: state.modal.open,
      variableID,
    },
  })),
  on(changeSelectedGroup, (state) => {
    if (state.modal.mode === 'options') {
      return {
        ...state,
        modal: {
          ...state.modal,
          open: false,
        },
      };
    }
    return {
      ...state,
    };
  }),
);
