import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';

export const environment = {
  production: false,
  domain: 'http://localhost:3489',
  matomoScriptUrl:
    'https://analytics.scholarsportal.info/js/container_MOTMjz1l.js',
  matomoTrackerUrl: 'https://analytics.scholarsportal.info/matomo.php',
  matomoSiteId: 128,
  serverUrl: 'https://analytics.scholarsportal.info',
  providers: [
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      connectInZone: true,
    }),
  ],
};
