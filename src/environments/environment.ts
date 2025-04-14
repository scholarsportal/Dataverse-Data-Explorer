import { provideStoreDevtools } from '@ngrx/store-devtools';

export const environment = {
  production: true,
  domain: 'http://localhost:3489',
  serverUrl: 'https://analytics.scholarsportal.info',
  providers: [
    provideStoreDevtools({
      maxAge: 25,
      logOnly: true,
      connectInZone: true,
    }),
  ],
  matomoTrackerUrl: '',
  matomoSiteId: '',
};
