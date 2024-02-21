import { createReducer, on } from '@ngrx/store';
import * as DatasetActions from '../actions/dataset.actions';
import { JSONStructure } from '../interface';

export interface DatasetState {
  dataset: JSONStructure | null;
  status: 'idle' | 'pending' | 'converting' | 'error' | 'success';
  errorMessage?: string | unknown;
}

export const initialState: DatasetState = {
  dataset: null,
  status: 'idle',
};

export const datasetReducer = createReducer(
  initialState,
  on(
    DatasetActions.setDataset,
    (state, { dataset }): DatasetState => ({
      ...state,
      dataset,
      status: 'success' as const,
    })
  ),
  on(
    DatasetActions.fetchDataset,
    (state): DatasetState => ({ ...state, status: 'pending' as const })
  ),
  on(
    DatasetActions.fetchDatasetError,
    (state, { error }): DatasetState => ({
      ...state,
      status: 'error' as const,
      errorMessage: error,
    })
  ),
  on(
    DatasetActions.datasetConversionPending,
    (state): DatasetState => ({ ...state, status: 'converting' as const })
  ),
  on(
    DatasetActions.datasetConversionSuccess,
    (state, { dataset }): DatasetState => ({
      ...state,
      dataset,
      status: 'success' as const,
    })
  ),
  on(
    DatasetActions.datasetConversionError,
    (state, { error }): DatasetState => ({
      ...state,
      status: 'error' as const,
      errorMessage: error,
    })
  ),
  on(DatasetActions.saveVariable, (state, { variableID, variable, groups }) => {
    const newState = JSON.parse(JSON.stringify(state));
    if (newState) {
      const variables = newState.dataset?.codeBook.dataDscr.var || [];
      const varGroups = newState.dataset?.codeBook.dataDscr.varGrp || [];
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
          variable.isWeight ?? (variables[index]['@_wgt'] = 'wgt');
          variables[index]['@_wgt-var'] = variable.weight ?? '';
          break;
        }
      }
      for (let index = 0; index < varGroups.length; index++) {
        console.log(groups.includes(varGroups[index]));
        // if current var group includes current id AND is not in the new group selected
        if (
          varGroups[index]['@_var'].split(' ').includes(variableID) &&
          !groups.includes(varGroups[index])
        ) {
          // console.log(varGroups[index]);
          const varArray = varGroups[index]['@_var'].split(' ');
          const variableIndex = varArray.indexOf(variableID);
          if (variableIndex !== -1) {
            console.log(varArray.join(' '));
            // varArray.splice(variableIndex, 1);
            // varGroups[index]['@_var'] = varArray.join(' ');
          }
        }
      }
    }
    return { ...newState };
  })
);
