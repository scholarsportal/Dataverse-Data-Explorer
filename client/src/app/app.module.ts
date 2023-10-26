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

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    TableComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    StoreModule.forRoot({ dataset: appReducer }, {}),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
    EffectsModule.forRoot([DataFetchEffect])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
