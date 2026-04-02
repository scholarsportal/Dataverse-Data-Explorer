// /**
//  * Flat key-value map of translation strings used by packages at runtime.
//  *
//  * Keys follow a prefix convention per package:
//  * - `CROSS_TAB.*` — cross-tab calculator strings
//  * - `VAR_EDITOR.*` — variable editor strings
//  * - `SHARED.*` — shared UI component strings
//  *
//  * Passed to packages via the `translations` signal input and consumed
//  * by `DDETranslatePipe` from `@dde/ui`.
//  */
// export type DDETranslations = Record<string, string>;
//
// /** Supported application locales — English and French Canadian. */
// export type DDELocale = 'en-CA' | 'fr-CA';
//
// /**
//  * Application colour theme.
//  * Applied via the ` [data-theme] ` attribute on the host element
//  * and propagated to packages via signal input.
//  */
// export type DDETheme = 'light' | 'dark';
//
// /**
//  * Status of an asynchronous operation (e.g., saving to Dataverse).
//  * Used by the variable editor to show loading/success/error states
//  * when the host app is processing a save request.
//  */
// export interface DDEOperationStatus {
//   state: 'idle' | 'pending' | 'success' | 'error';
//   /** User-facing message (e.g., error description or success confirmation). */
//   message?: string;
// }

/**
 * Template for mapping imported XML fields to DDEVariable properties.
 * Used by the variable editor's XML import feature to define which
 * source fields map to which target properties.
 */
export interface ImportVariableTemplate {
  /** Mapping of source XML field names to DDEVariable property names. */
  fields: Record<string, string>;
}
