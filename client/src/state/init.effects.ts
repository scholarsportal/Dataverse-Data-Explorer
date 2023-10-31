import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from "rxjs";
import { DdiService } from "src/app/services/ddi.service";
import { fetchDataset } from "./actions";
import * as fromActions from "./actions";

@Injectable()
export class DataFetchEffect {
    fetchDataset$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fetchDataset),
            switchMap(action =>
                this.ddi.get(action.fileID, action.siteURL).pipe(map(data => fromActions.datasetLoadSuccess({ data })),
                    catchError(error => of(fromActions.datasetLoadError(error)))))
        )
    )

    createNewVarGraph$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.variableViewChart),
            switchMap(action => {
                const { variable } = action;
                try {
                    const { id, weighted, unweighted } = this.createGraphObject(variable);
                    return of(fromActions.variableCreateGraphSuccess({ id, weighted, unweighted }));
                } catch (error) {
                    return of(fromActions.variableCreateGraphError({ error }))
                }
            })
        ))

    constructor(private actions$: Actions, private ddi: DdiService) {}

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

        console.log(weighted)

        const unweighted = variable.catgry.map((item: any) => ({
            label: item.label,
            frequency: item.frequency,
        }));

        return { id: variable['@_ID'], weighted, unweighted };
    }
}
