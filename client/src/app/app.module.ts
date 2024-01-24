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
import { ChartComponent } from './components/modal/chart/chart.component';
import { FormComponent } from './components/modal/form/form.component';
import { LetDirective, PushPipe } from '@ngrx/component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Design Components
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

// New Import
import { MultiselectDropdownComponent } from './components/modal/form/multiselect-dropdown/multiselect-dropdown.component';
import { NotificationComponent } from './components/notification/notification.component';
import { CdkColumnDef } from '@angular/cdk/table';
import { RouterModule } from '@angular/router';
import { AppEffects } from './state/app.effects';
import { reducers, metaReducers } from './state/reducers';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableNavComponent } from './components/table/table-nav/table-nav.component';
import { TableMenuComponent } from './components/table/table-menu/table-menu.component';
import { VariableOptionsComponent } from './components/table/variable-options/variable-options.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    TableComponent,
    ModalComponent,
    ChartComponent,
    FormComponent,
    MultiselectDropdownComponent,
    NotificationComponent,
  ],
  imports: [
    BrowserModule,
    // Add this line to activate http client
    HttpClientModule,
    RouterModule.forRoot([]),
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: !isDevMode(),
      connectInZone: true,
    }),
    // Add this to activate Forms
    FormsModule,
    ReactiveFormsModule,
    // Add this line to 'activate effects for actions'
    EffectsModule.forRoot([AppEffects]),
    // Using ngIf with ngRx
    LetDirective,
    // Using @Input with ngRx
    PushPipe,
    NgxDatatableModule,
    BrowserAnimationsModule,
    // Standalone Components
    TableNavComponent,
    TableMenuComponent,
    VariableOptionsComponent,
  ],
  providers: [CdkColumnDef],
  bootstrap: [AppComponent],
})
export class AppModule {}
