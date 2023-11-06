import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TableComponent } from './components/table/table.component';
import { ModalComponent } from './components/modal/modal.component';
import { EffectsModule } from '@ngrx/effects';
import { appReducer } from 'src/state/reducers';
import { DataFetchEffect } from 'src/state/init.effects';
import { HttpClientModule } from '@angular/common/http';
import { DataTablesModule } from 'angular-datatables';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartComponent } from './components/modal/chart/chart.component';
import { FormComponent } from './components/modal/form/form.component';
import { GroupTableComponent } from './components/table/group-table/group-table.component';
import { LetDirective, PushPipe } from '@ngrx/component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    TableComponent,
    ModalComponent,
    ChartComponent,
    FormComponent,
    GroupTableComponent
  ],
  imports: [
    BrowserModule,
    // Add this line to activate http client
    HttpClientModule,
    StoreModule.forRoot({ globalState: appReducer }, {}),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    // Add this line to 'activate effects for actions'
    EffectsModule.forRoot([DataFetchEffect]),
    // Using ngIf with ngRx
    LetDirective,
    // Using @Input with ngRx
    PushPipe,
    // Angular Datatables
    DataTablesModule,
    NgxDatatableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
