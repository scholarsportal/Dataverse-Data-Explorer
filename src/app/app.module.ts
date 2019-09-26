import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFrCa from '@angular/common/locales/fr-CA';

import {HttpClient} from '@angular/common/http';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {TranslateService, TranslateParser } from '@ngx-translate/core';
import {MatPaginatorIntl} from '@angular/material';


// the second parameter 'fr' is optional
registerLocaleData(localeFrCa, 'fr-CA');

import {
  MatButtonModule,
  MatTableModule,
  MatSortModule,
  MatTabsModule,
  MatIconModule,
  MatToolbarModule,
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
  MatAutocompleteModule
} from '@angular/material';

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
import {MyMatPaginatorIntl} from './mat-paginator-intl';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

export function createMyMatPaginatorIntl(

    translateService: TranslateService,

    translateParser: TranslateParser

) {return new MyMatPaginatorIntl(translateService, translateParser);}


@NgModule({
  declarations: [
    AppComponent,
    InterfaceComponent,
    VarGroupComponent,
    VarComponent,
    VarDialogComponent,
    VarStatDialogComponent,
    ChartComponent
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
    TranslateModule.forRoot({loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
}
})
  ],
  exports: [
  ],
  entryComponents: [VarDialogComponent, VarStatDialogComponent],
  providers: [DdiService, MatPaginatorIntl, {

    provide: MatPaginatorIntl,

    deps: [TranslateService, TranslateParser],

    useFactory: createMyMatPaginatorIntl

  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
