import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { DdiService } from 'src/app/services/ddi.service';
import * as fromActions from './actions';
import * as ModalActions from './actions/modal.actions';
import * as DatasetActions from './actions/dataset.actions';
import { SingleVariable, VariableGroups } from './interface';

@Injectable()
export class DataFetchEffect {
  // this side effect is called when the fetchDataset action is called,
  // it makes the actual http request and calls success if we get data
  // and error if we do not
  fetchDataset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.fetchDataset),
      switchMap((action) =>
        this.ddi.get(action.fileID, action.siteURL).pipe(
          map((data) => {
            return fromActions.datasetLoadPending(data)
          }),
          catchError((error) => of(fromActions.datasetLoadError(error)))
        )
      )
    )
  );

  transformData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.datasetLoadPending),
      map((data) => {

        const parsedData = this.parseJSON(data)

        return fromActions.datasetLoadSuccess(parsedData)
      })
    ))

  createVariableGroups = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.datasetLoadSuccess),
      map((action) => {
        const { groups } = action
        let variableGroups: VariableGroups = {}
        Object.keys( action.variables ).map((item: any) => {
            variableGroups[item] = { groups: {} }
        });

        Object.values(groups).map((item: any) => {
          item['@_var'].forEach((variable: string) => {
              variableGroups[variable].groups[item['@_ID']] = item['labl']
          })
        })
        return DatasetActions.datasetVariableGroupsLoaded({ variableGroups })
      })
    ))

  constructor(private actions$: Actions, private ddi: DdiService) {}

  private parseJSON(data: any): {variables: any, citation: any, groups: any, weightedVariables: any} {
    // console.log(data)
    const variables: any = {};
    const citation: any = data.codeBook.stdyDscr.citation || {};
    const groups: any = {};
    const weightedVariables: any = {};


    data.codeBook.dataDscr.var.forEach((item: any) => {
      let notes: string;

      // check if variable has notes (notes are second object in array)
      // if not we create the expected object anyway for consistency
      Array.isArray(item.notes) ? (notes = item.notes.at(-1)) : (notes = '')

      variables[item['@_ID']] = { ...item, notes }

      // if the variable has a weight var, we add that variable to var weights
      // in its correspoding weight
      if(item['@_wgt-var']){
        weightedVariables[item['@_wgt-var']] = true
      }
    });

    // Create variable groups
    data.codeBook.dataDscr.varGrp.forEach((item: any) => {
      groups[item['@_ID']] = { ...item, '@_var': new Set(item['@_var'].split(' ')), selected: new Set() }
    });

    return { variables, citation, groups, weightedVariables }

  }

}
