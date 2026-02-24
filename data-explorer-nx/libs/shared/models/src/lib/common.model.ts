export type DdeTranslations = { [key: string]: string };
export type DdeLocale = 'en-CA' | 'fr-CA';
export type DdeTheme = 'light' | 'dark';

export interface OperationStatus {
  save: 'idle' | 'pending' | 'success' | 'error';
  import: 'idle' | 'pending' | 'success' | 'error';
}