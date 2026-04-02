/**
 * Normalized variable model — the read-only view layer consumed by packages.
 *
 * Derived from the raw DDI JSON via `DdiNormalizer.toVariables()` in the host app.
 * Packages never see raw DDI — they receive `DDEVariable[]` via signal inputs.
 * All mutations flow back through package outputs and are applied to the raw DDI
 * by `DdiNormalizer.applyChanges()`.
 */
export interface DDEVariable {
  /** Unique identifier matching the DDI `var@ID` attribute (e.g. "v1", "v2"). */
  id: string;

  /** Variable name as it appears in the data file (DDI `var@name`). */
  name: string;

  /** Human-readable label for the variable (from DDI `labl` element). */
  label: string;

  /**
   * Measurement level of the variable.
   *
   * Maps from two DDI attributes:
   * - `var@intrvl` → "continuous" (from "contin") or "discrete"
   * - `var@nature` → "nominal", "ordinal", "interval", "ratio"
   */
  interval: DDEVariableInterval;

  /** Whether this variable is itself a weight variable (DDI `var@wgt="wgt"`). */
  isWeight: boolean;

  /** ID of the weight variable applied to this variable, or null if unweighted. */
  assignedWeightId: string | null;

  /** Question text associated with this variable (from DDI `qstn` element). */
  question: DDEQuestion;

  /** Universe (population) to which this variable applies. */
  universe: string;

  /** Free-text notes attached to this variable. */
  notes: string;

  /** Category values (codes) with labels, frequencies, and missing flags. */
  categories: DDECategory[];

  /** Descriptive statistics (mean, median, mode, etc.) for this variable. */
  summaryStatistics: DDESummaryStatistics;

  /** Display format string (e.g. "F8.2" for SPSS numeric). */
  format: string;
}

/**
 * Measurement level for a variable.
 *
 * Combines DDI's `intrvl` attribute ("contin"/"discrete") with the `nature`
 * attribute ("nominal"/"ordinal"/"interval"/"ratio") into a single union.
 */
export type DDEVariableInterval =
  | 'nominal'
  | 'ordinal'
  | 'interval'
  | 'ratio'
  | 'continuous'
  | 'discrete';

/**
 * Question text associated with a survey variable.
 * Derived from the DDI `qstn` element's child elements.
 */
export interface DDEQuestion {
  /** The literal question text shown to respondents (DDI `qstnLit`). */
  literal: string;

  /** Instructions for the interviewer (DDI `ivuInstr`). */
  interviewer: string;

  /** Text shown after the question (DDI `postQTxt`). */
  post: string;
}

/**
 * A single category (code value) within a variable.
 * Used in the variable editor and cross-tab calculator to display
 * value labels, frequencies, and filter out missing values.
 */
export interface DDECategory {
  /** The code value (e.g. "1", "2", "99"). */
  value: string;

  /** Human-readable label for this code (e.g. "Male", "Female"). */
  label: string;

  /** Observed frequency count for this category. */
  frequency: number;

  /** Whether this category represents a missing/inapplicable value. */
  isMissing: boolean;
}

/**
 * Logical grouping of related variables.
 * Derived from DDI `varGrp` elements. Used in the variable editor sidebar
 * and the cross-tab calculator's variable selection dropdown.
 */
export interface DDEVariableGroup {
  /** Unique identifier matching the DDI `varGrp@ID` attribute. */
  id: string;

  /** Display label for the group. */
  label: string;

  /** Ordered list of variable IDs belonging to this group. */
  variableIds: string[];
}

/**
 * Descriptive statistics for a variable.
 * Derived from DDI `sumStat` elements with `@_type` values:
 * mean, medn, mode, stdev, min, max, vald, invd.
 *
 * All fields are optional — not all variables have all statistics.
 */
export interface DDESummaryStatistics {
  mean?: number;
  mode?: number;
  median?: number;
  standardDeviation?: number;
  minimum?: number;
  maximum?: number;
  /** Count of valid (non-missing) observations. */
  validCount?: number;
  /** Count of invalid (missing) observations. */
  invalidCount?: number;
}

/**
 * Payload emitted by the variable editor when a single variable is saved.
 * The host app uses this to apply changes to the raw DDI via DdiNormalizer.
 */
export interface DDEVariableSavedEvent {
  variableId: string;
  changes: Partial<DDEVariable>;
  groupIds: string[];
}

/**
 * Payload emitted by the variable editor when multiple variables
 * are bulk-edited (e.g. assigning the same universe to a selection).
 */
export interface DDEBulkVariablesSavedEvent {
  variableIds: string[];
  changes: Partial<DDEVariable>;
}
