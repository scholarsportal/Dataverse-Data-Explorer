import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { EffectsModule } from '@ngrx/effects';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreModule } from '@ngrx/store';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { xmlReducer } from './app/new.state/xml/xml.reducer';
import { datasetReducer } from './app/new.state/dataset/dataset.reducer';
import { XmlEffects } from './app/new.state/xml/xml.effects';
import { uiReducer } from './app/new.state/ui/ui.reducer';
import { DatasetEffects } from './app/new.state/dataset/dataset.effects';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { provideMatomo } from 'ngx-matomo-client';
import { environment } from './environments/environment';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      TranslateModule.forRoot({
        defaultLanguage: 'en-CA',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
      StoreModule.forRoot({
        xml: xmlReducer,
        dataset: datasetReducer,
        ui: uiReducer,
      }),
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        logOnly: !isDevMode(),
        connectInZone: true,
      }),
      // Add this line to 'activate effects for actions'
      EffectsModule.forRoot([XmlEffects, DatasetEffects]),
    ),
    provideMatomo({
      scriptUrl: environment.matomoScriptUrl,
    }),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter([]),
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
