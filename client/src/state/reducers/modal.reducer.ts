import { createReducer, on } from '@ngrx/store';
import * as Actions from './../actions';
import { VarGroups, Variables, Citation } from '../interface';

export interface ModalState {
    open: boolean;
    mode: string;
    id: string | null;
    variable: any | null;
    graph: any | null;
    state: 'saved' | 'changes' | '';
}

const initialState: ModalState = {
    open: false,
    id: null,
    mode: '',
    variable: null,
    graph: null,
    state: 'saved'
};

const modalReducer = createReducer(
    initialState,
);

export function modalReducerFn(state: ModalState, action: any) {
   return modalReducer(state, action)
}
