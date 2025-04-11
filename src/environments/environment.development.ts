import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';

export const environment = {
  production: false,
  domain: 'http://localhost:3489',
  serverUrl: 'https://analytics.scholarsportal.info',
  providers: [
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      connectInZone: true,
    }),
  ],
  matomoTrackerUrl: '',
  matomoSiteId: ''
};
