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

export interface UIState {
  modal: {
    open: boolean;
    mode: null | 'options' | 'view' | 'edit';
    variableID: string | null;
  };
}

export const initialState: UIState = {
  modal: {
    open: false,
    mode: null,
    variableID: null,
  },
};

export const uiReducer = createReducer(
  initialState,
  on(
    openOptionsMenu,
    (state): UIState => ({
      ...state,
      modal: {
        open: true,
        mode: 'options' as const,
        variableID: null,
      },
    })
  ),
  on(
    closeOptionsMenu,
    (state): UIState => ({
      ...state,
      modal: {
        open: false,
        mode: null,
        variableID: null,
      },
    })
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
  }))
);
