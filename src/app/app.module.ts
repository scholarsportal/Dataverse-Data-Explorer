import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TableComponent } from './components/table/table.component';
import { EffectsModule } from '@ngrx/effects';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material Design Components
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// New Import
import { NotificationComponent } from './components/notification/notification.component';
import { RouterModule } from '@angular/router';
import { AppEffects } from './state/app.effects';
import { reducers, metaReducers } from './state/reducers';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TableNavComponent } from './components/table/table-nav/table-nav.component';
import { TableMenuComponent } from './components/table/table-menu/table-menu.component';
import { VariableOptionsComponent } from './components/table/variable-options/variable-options.component';
import { OptionsComponent } from './components/sidebar/options/options.component';
import { ModalComponent } from './components/table/modal/modal.component';
import { CrossTabulationComponent } from './components/cross-tabulation/cross-tabulation.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    TableComponent,
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
    NgxDatatableModule,
    BrowserAnimationsModule,
    // Standalone Components
    VariableOptionsComponent,
    TableNavComponent,
    TableMenuComponent,
    OptionsComponent,
    ModalComponent,
    CrossTabulationComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
