import { createReducer, on } from '@ngrx/store';
import { JSONStructure, Variable } from '../interface';
import { closeOptionsMenu, openOptionsMenu } from '../actions/ui.actions';

export interface UIState {
  modal: {
    open: boolean;
    type: null | 'options' | 'view' | 'edit';
    variable: {
      id: string | null;
      variable: Variable | null;
    };
  };
}

export const initialState: UIState = {
  modal: {
    open: false,
    type: null,
    variable: {
      id: null,
      variable: null,
    },
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
        type: 'options' as const,
        variable: {
          id: null,
          variable: null,
        },
      },
    })
  ),
  on(
    closeOptionsMenu,
    (state): UIState => ({
      ...state,
      modal: {
        open: false,
        type: null,
        variable: {
          id: null,
          variable: null,
        },
      },
    })
  )
);
