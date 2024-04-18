import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ddiJSONStructure } from './xml.interface';

export const selectXmlFeature =
  createFeatureSelector<{ dataset?: ddiJSONStructure }>('xml');

export const selectDatasetVariables =
  createSelector(selectXmlFeature, (state) =>
    state.dataset?.codeBook.dataDscr.var);

export const selectDatasetVariableGroups =
  createSelector(selectXmlFeature, (state) =>
    state.dataset?.codeBook.dataDscr.varGrp);
