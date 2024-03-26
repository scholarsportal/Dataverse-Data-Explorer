import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AppEffects } from './app/state/app.effects';
import { EffectsModule } from '@ngrx/effects';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { isDevMode, importProvidersFrom } from '@angular/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducers, metaReducers } from './app/state/reducers';
import { StoreModule } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import {
  withInterceptorsFromDi,
  provideHttpClient,
} from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      StoreModule.forRoot(reducers, { metaReducers }),
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        logOnly: !isDevMode(),
        connectInZone: true,
      }),
      // Add this line to 'activate effects for actions'
      EffectsModule.forRoot([AppEffects]),
    ),
    NgxDatatableModule,
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter([]),
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
