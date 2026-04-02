/**
 * Request and result types for the compute layer (`@dde/compute`).
 *
 * These types are shared between:
 * - Web Workers (browser-only mode) — used via `postMessage`
 * - Hono API routes (Docker mode) — used as request/response bodies
 * - `ComputeService` in the host app — which dispatches to either runtime
 *
 * All compute functions are pure: types in, results out, no side effects.
 */

import type {
  AggregatorType,
  CrossTabMissingCategories,
  CrossTabObservationData,
  CrossTabSelection,
} from './cross-tab';
import type { DDIJsonStructure } from './ddi';
import type { DDEVariable, DDEVariableGroup } from './variable';

// ---------------------------------------------------------------------------
// Cross-tab computation
// ---------------------------------------------------------------------------

/**
 * Request payload for `computeCrossTab()`.
 * Sent to a Web Worker or the `/api/cross-tab` Hono endpoint.
 */
export interface CrossTabRequest {
  /** Observation data keyed by variable ID. */
  observations: CrossTabObservationData;
  /** Variables assigned to row/column axes. */
  selections: CrossTabSelection[];
  /** Categories to exclude from aggregation per variable. */
  missing: CrossTabMissingCategories;
  /** Aggregation function to apply. */
  aggregator: AggregatorType;
}

/**
 * Result of a cross-tab computation — a fully computed pivot table.
 * Consumed by `PivotTableComponent` in `@dde/pivot-table` for rendering.
 */
export interface PivotResult {
  /** Data rows, each with a key (row header) and aggregated cell values. */
  rows: PivotRow[];
  /** Ordered column header labels. */
  columnHeaders: string[];
  /** Ordered row header labels. */
  rowHeaders: string[];
  /** Grand totals for columns and the overall grand total. */
  grandTotals: PivotGrandTotals;
}

/** A single row in the pivot result table. */
export interface PivotRow {
  /** Row header label (e.g. a category value). */
  key: string;
  /** Aggregated values, one per column. */
  values: number[];
  /** Row total (sum of all values in this row). */
  total: number;
}

/** Grand totals for the pivot table footer. */
export interface PivotGrandTotals {
  /** Column totals, one per column. */
  columns: number[];
  /** Overall grand total. */
  grand: number;
}

// ---------------------------------------------------------------------------
// Weight computation
// ---------------------------------------------------------------------------

/**
 * Request payload for `computeWeights()`.
 * Sent to a Web Worker or the `/api/weights` Hono endpoint.
 */
export interface WeightRequest {
  /** Observation data keyed by variable ID. */
  observations: CrossTabObservationData;
  /** IDs of variables to compute weighted statistics for. */
  variableIds: string[];
  /** ID of the weight variable to apply. */
  weightId: string;
}

/**
 * Result of a weight computation.
 * Contains weighted frequencies and summary statistics per variable.
 */
export interface WeightResult {
  /** Weighted frequency counts: variableId → categoryValue → weighted count. */
  weightedFrequencies: Record<string, Record<string, number>>;
  /** Weighted summary statistics per variable. */
  weightedSummaryStatistics: Record<string, WeightedSummaryStatEntry>;
}

/** Weighted summary statistics for a single variable. */
export interface WeightedSummaryStatEntry {
  mean?: number;
  standardDeviation?: number;
  minimum?: number;
  maximum?: number;
  validCount?: number;
  invalidCount?: number;
}

// ---------------------------------------------------------------------------
// DDI parsing
// ---------------------------------------------------------------------------

/**
 * Request payload for `parseDdiXml()`.
 * Sent to a Web Worker or the `/api/parse-ddi` Hono endpoint.
 */
export interface DdiParseRequest {
  /** Raw DDI XML string to parse. */
  xml: string;
}

/**
 * Result of parsing DDI XML — contains both the raw JSON structure
 * (for round-trip fidelity) and the normalized view-layer models.
 */
export interface DdiParseResult {
  /** Raw DDI JSON as produced by fast-xml-parser (canonical source of truth). */
  ddiJson: DDIJsonStructure;
  /** Normalized variables derived from the raw DDI. */
  variables: DDEVariable[];
  /** Normalized variable groups derived from the raw DDI. */
  variableGroups: DDEVariableGroup[];
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

/**
 * Request payload for `generateCsv()`.
 * Sent to a Web Worker or the `/api/export-csv` Hono endpoint.
 */
export interface CsvExportRequest {
  /** The pivot result to export as CSV. */
  result: PivotResult;
}
