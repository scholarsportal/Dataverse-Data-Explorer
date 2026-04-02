/**
 * Observation data keyed by variable ID, where each value is an array
 * of string observations (one per case/row in the dataset).
 *
 * Example: `{ "GENDER": ["1", "2", "1", "1"], "AGE": ["3", "96", "96", "96"] }`
 *
 * Used by the cross-tab calculator for aggregation and by the host app
 * for weight computation. Fetched separately from the DDI metadata via
 * the Dataverse API.
 * Note that the numbers in the arrays represent categorical codes, they must be mapped to
 * proper variable labels using the DDI variable metadata.
 * i.e. under GENDER variable, "2" might map to "Male", "1" might map to "Female".
 */
export type CrossTabObservationData = Record<string, string[]>;

/**
 * Missing categories keyed by variable ID.
 * Each Set contains category values that should be excluded from
 * cross-tab aggregation (e.g. "99" for "not applicable").
 *
 * Managed by the cross-tab calculator's missing category filter UI.
 */
export type CrossTabMissingCategories = Record<string, Set<string>>;

/**
 * A variable assigned to a cross-tab axis.
 * The cross-tab calculator emits these to indicate which variables
 * the user has selected for rows vs. columns.
 */
export interface CrossTabSelection {
  /** ID of the selected variable (matches DdeVariable.id). */
  variableId: string;

  /** Whether this variable is on the row or column axis. */
  axis: 'row' | 'column';
}

/**
 * Aggregation function applied to cross-tab cells.
 * Determines how observation values are summarized in each pivot cell.
 */
export type AggregatorType =
  | 'count'
  | 'sum'
  | 'average'
  | 'minimum'
  | 'maximum';

/**
 * How cell values are expressed relative to totals.
 * - `'none'`: raw aggregated values
 * - `'row'`: percentage of row total
 * - `'column'`: percentage of column total
 * - `'total'`: percentage of grand total
 */
// export type PercentageMode = 'none' | 'row' | 'column' | 'total';
