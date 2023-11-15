import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { DdiService } from 'src/app/services/ddi.service';
import * as fromActions from './actions';
import { Variables } from './reducers';

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
          map(({variables, groups, citation, varWeights}) => fromActions.datasetLoadSuccess({ variables, groups, citation, varWeights })),
          catchError((error) => of(fromActions.datasetLoadError(error)))
        )
      )
    )
  );
  // createVariableGroups = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(fromActions.datasetLoadSuccess),
  //     mergeMap((action) => {
  //       const { data } = action;
  //       try {
  //         // Here, we create metadata from the loaded data and dispatch the success or error action accordingly
  //         // If the metadata returns a warning (it loads the variables and groups with hiccups), we need to handle that gracefully
  //         const metadata = this.createVarMetadata(data.codeBook);
  //         return of(
  //           fromActions.datasetCreateMetadataSuccess({
  //             groups: metadata.groups,
  //             variables: metadata.variables,
  //           })
  //         );
  //       } catch (error) {
  //         return of(fromActions.datasetCreateMetadataError({ error }));
  //       }
  //     }),
  //     catchError((error) => {
  //       return of(fromActions.datasetCreateMetadataError({ error }));
  //     })
  //   )
  // );

  createNewVarGraph$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.variableViewChart),
      switchMap((action) => {
        const { variable } = action;
        try {
          const { id, weighted, unweighted } = this.createGraphObject(variable);
          return of(
            fromActions.variableCreateGraphSuccess({ id, weighted, unweighted })
          );
        } catch (error) {
          return of(fromActions.variableCreateGraphError({ error }));
        }
      })
    )
  );

  constructor(private actions$: Actions, private ddi: DdiService) {}

  // createVarMetadata(data: any) {
  //   const variables: Variables = {};
  //   const groups: any = {};

  //   const vars: any = data.dataDscr.var || [];
  //   vars.forEach((item: any) => (variables[item['@_ID']] = item));

  //   const varGrps: any = data.dataDscr.varGrp || [];
  //   varGrps.forEach((item: any) => {
  //     // Here I have the option to create the variabes directly in the groups
  //     // by using the resulting variable list as a reference.
  //     // I am choosing not to, because the potential worst case complexity is
  //     // n^n
  //     groups[item['@_ID']] = { item, variable: item['@_var'].split(' ') };
  //   });

  //   return { groups, variables };
  // }

  createGraphObject(variable: any) {
    // Perform the calculations and return the result.
    // Example logic for calculating weighted and unweighted variables:
    const weighted = variable.catgry.map((item: any) => ({
      label: item.labl['#text'],
      frequency: (() => {
        const weighted = item.catStat.find((type: any) => type['@_wgtd']);
        return weighted ? weighted['#text'] : null;
      })(), // Modify this calculation as needed
    }));

    const unweighted = variable.catgry.map((item: any) => ({
      label: item.label,
      frequency: item.frequency,
    }));

    return { id: variable['@_ID'], weighted, unweighted };
  }
}
