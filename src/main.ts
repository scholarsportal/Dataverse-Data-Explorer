import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreModule } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { xmlReducer } from './app/new.state/xml/xml.reducer';
import { datasetReducer } from './app/new.state/dataset/dataset.reducer';
import { XmlEffects } from './app/new.state/xml/xml.effects';
import { uiReducer } from './app/new.state/ui/ui.reducer';
import { DatasetEffects } from './app/new.state/dataset/dataset.effects';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      StoreModule.forRoot({ xml: xmlReducer, dataset: datasetReducer, ui: uiReducer }),
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        logOnly: !isDevMode(),
        connectInZone: true
      }),
      // Add this line to 'activate effects for actions'
      EffectsModule.forRoot([XmlEffects, DatasetEffects])
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter([]),
    provideAnimations()
  ]
}).catch((err) => console.error(err));
