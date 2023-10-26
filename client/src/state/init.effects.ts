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
    constructor(private actions$: Actions, private ddi: DdiService) {}
}
