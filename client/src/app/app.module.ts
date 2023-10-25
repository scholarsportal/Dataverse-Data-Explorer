import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFrCa from '@angular/common/locales/fr-CA';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { TranslateService, TranslateParser } from '@ngx-translate/core';
import { MatLegacyPaginatorIntl as MatPaginatorIntl } from '@angular/material/legacy-paginator';

import { MatomoTracker, NgxMatomoTrackerModule } from '@ngx-matomo/tracker';

import { APP_INITIALIZER } from '@angular/core';
import { ConfigService } from './config.service';
import { of, Observable, ObservableInput } from '../../node_modules/rxjs';
import { map, catchError } from 'rxjs/operators';

// the second parameter 'fr' is optional
registerLocaleData(localeFrCa, 'fr-CA');

import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { DdiService } from './ddi.service';
import { InterfaceComponent } from './interface/interface.component';
import { HttpClientModule } from '@angular/common/http';
import { VarGroupComponent } from './var-group/var-group.component';
import { VarComponent } from './var/var.component';
import { VarDialogComponent } from './var-dialog/var-dialog.component';
import { VarStatDialogComponent } from './var-stat-dialog/var-stat-dialog.component';
import { ChartComponent } from './chart/chart.component';
import { MyMatPaginatorIntl } from './mat-paginator-intl';
import { HomeComponent } from './pages/home/HomeComponent';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

export function createMyMatPaginatorIntl(
  translateService: TranslateService,

  translateParser: TranslateParser
) {
  return new MyMatPaginatorIntl(translateService, translateParser);
}

export function load(
  http: HttpClient,
  config: ConfigService
): () => Promise<boolean> {
  return (): Promise<boolean> => {
    return new Promise<boolean>((resolve: (a: boolean) => void): void => {
      http
        .get('./assets/config.json')
        .pipe(
          map((x: ConfigService) => {
            config.baseUrl = x.baseUrl;
            console.log(config.baseUrl);
            config.id = x.id;
            resolve(true);
          }),
          catchError(
            (
              x: { status: number },
              caught: Observable<void>
            ): ObservableInput<{}> => {
              if (x.status !== 404) {
                resolve(false);
              }
              config.baseUrl = '';
              config.id = -1;
              resolve(true);
              return of({});
            }
          )
        )
        .subscribe();
    });
  };
}
@NgModule({
  declarations: [
    AppComponent,
    InterfaceComponent,
    VarGroupComponent,
    VarComponent,
    VarDialogComponent,
    VarStatDialogComponent,
    ChartComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatToolbarModule,
    MatTableModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    MatCheckboxModule,
    MatSelectModule,
    MatGridListModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatAutocompleteModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgxMatomoTrackerModule.forRoot({
      siteId: -1,
      trackerUrl: '' // your matomo server root url
    })
  ],
  exports: [],
  providers: [
    DdiService,
    MatPaginatorIntl,
    {
      provide: MatPaginatorIntl,
      deps: [TranslateService, TranslateParser],
      useFactory: createMyMatPaginatorIntl
    },
    {
      provide: APP_INITIALIZER,
      useFactory: load,
      deps: [HttpClient, ConfigService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private config: ConfigService, private tracker: MatomoTracker) {
    console.log(config.baseUrl);
    this.tracker.setSiteId(config.id);
    this.tracker.setTrackerUrl(config.baseUrl);
  }
}
