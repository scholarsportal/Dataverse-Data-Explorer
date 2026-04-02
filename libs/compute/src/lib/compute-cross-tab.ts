/**
 * Pure cross-tab computation function for `@dde/compute`.
 *
 * Calculates a pivot table from observation data, variable selections,
 * missing-category filters, and an aggregation function.
 *
 * Zero Angular dependencies — runs identically in:
 *   - Web Workers (browser-only mode)
 *   - Hono API routes (Docker mode)
 *   - Unit tests (Vitest)
 *
 * @module @dde/compute
 */

import type {
  AggregatorType,
  CrossTabMissingCategories,
  CrossTabObservationData,
  CrossTabSelection,
} from '@dde/models';
import type {
  CrossTabRequest,
  PivotResult,
  PivotRow,
  PivotGrandTotals,
} from '@dde/models';
import type { DDEVariable, DDECategory } from '@dde/models';

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Builds a lookup from raw category value → category label for a variable.
 *
 * Only categories NOT in the `missing` set are included.
 * This means any observation whose raw value maps to a missing/excluded
 * category will fail lookup and be skipped during aggregation.
 */
function buildCategoryLabelMap(
  variable: DDEVariable,
  missing: Set<string> | undefined,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const cat of variable.categories) {
    if (missing && missing.has(cat.value)) continue;
    map.set(cat.value, cat.label);
  }
  return map;
}

/**
 * Returns the ordered, deduplicated list of category labels for a variable
 * (preserving the DDI-defined order), excluding any in the missing set.
 */
function getOrderedLabels(
  variable: DDEVariable,
  missing: Set<string> | undefined,
): string[] {
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const cat of variable.categories) {
    if (missing && missing.has(cat.value)) continue;
    if (!seen.has(cat.label)) {
      seen.add(cat.label);
      labels.push(cat.label);
    }
  }
  return labels;
}

/**
 * Generates all composite header keys from multiple variables on the same axis.
 *
 * For a single variable, this returns its ordered category labels.
 * For multiple variables, this returns the Cartesian product joined with " - ".
 *
 * Example: ["Male", "Female"] × ["Yes", "No"] →
 *   ["Male - Yes", "Male - No", "Female - Yes", "Female - No"]
 */
function buildCompositeHeaders(
  variables: DDEVariable[],
  missing: CrossTabMissingCategories,
): string[] {
  if (variables.length === 0) return [];

  let headers = getOrderedLabels(variables[0], missing[variables[0].id]);

  for (let i = 1; i < variables.length; i++) {
    const nextLabels = getOrderedLabels(variables[i], missing[variables[i].id]);
    const combined: string[] = [];
    for (const existing of headers) {
      for (const next of nextLabels) {
        combined.push(`${existing} - ${next}`);
      }
    }
    headers = combined;
  }

  return headers;
}

// ─── Core aggregation ────────────────────────────────────────────────────────

/**
 * Internal accumulator cell for two-pass aggregation.
 * First pass collects raw numeric values; second pass computes the final
 * aggregate according to the requested `AggregatorType`.
 */
interface CellAccumulator {
  count: number;
  sum: number;
  min: number;
  max: number;
}

function newAccumulator(): CellAccumulator {
  return { count: 0, sum: 0, min: Infinity, max: -Infinity };
}

function addToAccumulator(acc: CellAccumulator, value: number): void {
  acc.count += 1;
  acc.sum += value;
  if (value < acc.min) acc.min = value;
  if (value > acc.max) acc.max = value;
}

function resolveAccumulator(acc: CellAccumulator, aggregator: AggregatorType): number {
  switch (aggregator) {
    case 'count':
      return acc.count;
    case 'sum':
      return acc.sum;
    case 'average':
      return acc.count > 0 ? acc.sum / acc.count : 0;
    case 'minimum':
      return acc.count > 0 ? acc.min : 0;
    case 'maximum':
      return acc.count > 0 ? acc.max : 0;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Computes a cross-tabulation pivot table.
 *
 * ## Algorithm
 *
 * 1. **Setup** — Build category-value → label lookup maps for each selected
 *    variable, filtering out missing categories.
 *
 * 2. **Single-pass iteration** — Walk through every observation (row) in the
 *    dataset. For each row:
 *    - Resolve the composite row key by looking up the category label for each
 *      ROW-axis variable. If any lookup fails (value not in categories, or
 *      excluded by the missing filter), skip the entire observation.
 *    - Resolve the composite column key the same way for COLUMN-axis variables.
 *    - Determine the numeric value to aggregate:
 *      - For `'count'` aggregator: always 1.0
 *      - For `'sum'`/`'average'`/`'minimum'`/`'maximum'`: parse the raw
 *        observation value of the **first row variable** as a float (this
 *        matches the existing app's behavior where sum uses the first
 *        variable's numeric value — but in practice, the weight variable
 *        approach is used instead; see `computeWeightedCrossTab`).
 *    - Accumulate into a `CellAccumulator` keyed by `[rowKey][colKey]`.
 *
 * 3. **Resolve** — Convert each accumulator to a final number using the
 *    aggregator function, then assemble `PivotRow[]`, column totals, and
 *    grand total.
 *
 * ## Weight Support
 *
 * The existing Data Explorer applies weights by multiplying each observation's
 * contribution by its weight value. This is equivalent to using the `'sum'`
 * aggregator where the observation values in `CrossTabObservationData` have
 * already been set to the weight variable's values (or pre-multiplied).
 *
 * For the rewrite, the recommended pattern is:
 * ```ts
 * // In the host app, before calling computeCrossTab:
 * if (weightVariableId) {
 *   // Replace each variable's observations with the weight value
 *   // so that sum aggregation produces weighted counts
 *   request.observations = applyWeights(observations, weightVariableId);
 *   request.aggregator = 'sum';
 * }
 * ```
 *
 * Alternatively, use the `computeWeightedCrossTab` convenience wrapper below.
 *
 * @param request - The cross-tab computation request
 * @param variables - All variables in the dataset (for category lookups)
 * @returns A fully computed `PivotResult` ready for rendering
 */
export function computeCrossTab(
  request: CrossTabRequest,
  variables: DDEVariable[],
): PivotResult {
  const { observations, selections, missing, aggregator } = request;

  // ── Partition selections by axis ──
  const rowSelections = selections.filter((s) => s.axis === 'row');
  const colSelections = selections.filter((s) => s.axis === 'column');

  // ── Build variable lookup (id → DDEVariable) ──
  const varById = new Map<string, DDEVariable>();
  for (const v of variables) {
    varById.set(v.id, v);
  }

  // ── Resolve selected DDEVariable objects ──
  const rowVars = rowSelections
    .map((s) => varById.get(s.variableId))
    .filter((v): v is DDEVariable => v !== undefined);
  const colVars = colSelections
    .map((s) => varById.get(s.variableId))
    .filter((v): v is DDEVariable => v !== undefined);

  // ── Build category label maps per variable ──
  const labelMaps = new Map<string, Map<string, string>>();
  for (const v of [...rowVars, ...colVars]) {
    if (!labelMaps.has(v.id)) {
      labelMaps.set(v.id, buildCategoryLabelMap(v, missing[v.id]));
    }
  }

  // ── Pre-compute ordered headers ──
  const rowHeaders = buildCompositeHeaders(rowVars, missing);
  const colHeaders = buildCompositeHeaders(colVars, missing);

  // ── Determine observation count (from first variable's data length) ──
  const allVarIds = [...rowSelections, ...colSelections].map((s) => s.variableId);
  if (allVarIds.length === 0) {
    return emptyResult();
  }

  const firstObs = observations[allVarIds[0]];
  if (!firstObs) {
    return emptyResult();
  }
  const observationCount = firstObs.length;

  // ── Single-pass accumulation ──
  // Keyed: accumulators[rowKey][colKey] = CellAccumulator
  const accumulators = new Map<string, Map<string, CellAccumulator>>();

  for (let i = 0; i < observationCount; i++) {
    // Resolve row composite key
    let skipObs = false;
    const rowParts: string[] = [];

    for (const rv of rowVars) {
      const rawVal = observations[rv.id]?.[i];
      if (rawVal === undefined) { skipObs = true; break; }
      const label = labelMaps.get(rv.id)!.get(rawVal);
      if (!label) { skipObs = true; break; }
      rowParts.push(label);
    }
    if (skipObs) continue;

    // Resolve column composite key
    const colParts: string[] = [];
    for (const cv of colVars) {
      const rawVal = observations[cv.id]?.[i];
      if (rawVal === undefined) { skipObs = true; break; }
      const label = labelMaps.get(cv.id)!.get(rawVal);
      if (!label) { skipObs = true; break; }
      colParts.push(label);
    }
    if (skipObs) continue;

    const rowKey = rowParts.join(' - ');
    const colKey = colParts.length > 0 ? colParts.join(' - ') : '';

    // Determine the numeric value to aggregate
    let numericValue: number;
    if (aggregator === 'count') {
      numericValue = 1;
    } else {
      // For sum/average/min/max, use the first row variable's raw value
      const rawVal = observations[rowVars[0].id]?.[i];
      numericValue = rawVal !== undefined ? parseFloat(rawVal) || 0 : 0;
    }

    // Accumulate
    if (!accumulators.has(rowKey)) {
      accumulators.set(rowKey, new Map());
    }
    const rowMap = accumulators.get(rowKey)!;
    if (!rowMap.has(colKey)) {
      rowMap.set(colKey, newAccumulator());
    }
    addToAccumulator(rowMap.get(colKey)!, numericValue);
  }

  // ── Resolve accumulators → PivotResult ──
  const effectiveColHeaders = colHeaders.length > 0 ? colHeaders : [''];

  const pivotRows: PivotRow[] = [];
  const colTotals = new Array<number>(effectiveColHeaders.length).fill(0);
  let grandTotal = 0;

  for (const rowKey of rowHeaders) {
    const values: number[] = [];
    let rowTotal = 0;

    for (let ci = 0; ci < effectiveColHeaders.length; ci++) {
      const colKey = effectiveColHeaders[ci];
      const acc = accumulators.get(rowKey)?.get(colKey);
      const val = acc ? resolveAccumulator(acc, aggregator) : 0;
      values.push(val);
      rowTotal += val;
      colTotals[ci] += val;
    }

    grandTotal += rowTotal;
    pivotRows.push({ key: rowKey, values, total: rowTotal });
  }

  return {
    rows: pivotRows,
    columnHeaders: effectiveColHeaders,
    rowHeaders,
    grandTotals: {
      columns: colTotals,
      grand: grandTotal,
    },
  };
}

// ─── Weighted cross-tab convenience wrapper ──────────────────────────────────

/**
 * Computes a **weighted** cross-tabulation.
 *
 * This is a convenience wrapper that:
 * 1. Replaces each observation value with the corresponding weight value
 * 2. Runs `computeCrossTab` with aggregator `'sum'`
 *
 * The result is a pivot table where each cell contains the sum of weight
 * values for observations matching that row × column combination.
 * Without weighting, this is equivalent to frequency counts.
 *
 * ## How it works
 *
 * For each observation index `i`:
 * - The "value" contributed to the cross-tab is `parseFloat(observations[weightId][i])`
 * - If no weight variable is specified, the value is `1.0` (frequency count)
 *
 * @param request - The base cross-tab request (aggregator field is ignored)
 * @param variables - All variables in the dataset
 * @param weightVariableId - ID of the weight variable, or null for unweighted
 * @returns A fully computed `PivotResult`
 */
export function computeWeightedCrossTab(
  request: CrossTabRequest,
  variables: DDEVariable[],
  weightVariableId: string | null,
): PivotResult {
  const { observations, selections, missing } = request;

  // ── Partition selections ──
  const rowSelections = selections.filter((s) => s.axis === 'row');
  const colSelections = selections.filter((s) => s.axis === 'column');

  // ── Build variable lookup ──
  const varById = new Map<string, DDEVariable>();
  for (const v of variables) varById.set(v.id, v);

  const rowVars = rowSelections
    .map((s) => varById.get(s.variableId))
    .filter((v): v is DDEVariable => v !== undefined);
  const colVars = colSelections
    .map((s) => varById.get(s.variableId))
    .filter((v): v is DDEVariable => v !== undefined);

  // ── Build category label maps ──
  const labelMaps = new Map<string, Map<string, string>>();
  for (const v of [...rowVars, ...colVars]) {
    if (!labelMaps.has(v.id)) {
      labelMaps.set(v.id, buildCategoryLabelMap(v, missing[v.id]));
    }
  }

  // ── Pre-compute ordered headers ──
  const rowHeaders = buildCompositeHeaders(rowVars, missing);
  const colHeaders = buildCompositeHeaders(colVars, missing);

  const allVarIds = [...rowSelections, ...colSelections].map((s) => s.variableId);
  if (allVarIds.length === 0) return emptyResult();

  const firstObs = observations[allVarIds[0]];
  if (!firstObs) return emptyResult();
  const observationCount = firstObs.length;

  // ── Get weight data ──
  const weightData = weightVariableId ? observations[weightVariableId] : null;

  // ── Accumulate weighted sums ──
  // Direct sum accumulation (no intermediate CellAccumulator needed)
  const data = new Map<string, Map<string, number>>();

  for (let i = 0; i < observationCount; i++) {
    let skip = false;
    const rowParts: string[] = [];

    for (const rv of rowVars) {
      const rawVal = observations[rv.id]?.[i];
      if (rawVal === undefined) { skip = true; break; }
      const label = labelMaps.get(rv.id)!.get(rawVal);
      if (!label) { skip = true; break; }
      rowParts.push(label);
    }
    if (skip) continue;

    const colParts: string[] = [];
    for (const cv of colVars) {
      const rawVal = observations[cv.id]?.[i];
      if (rawVal === undefined) { skip = true; break; }
      const label = labelMaps.get(cv.id)!.get(rawVal);
      if (!label) { skip = true; break; }
      colParts.push(label);
    }
    if (skip) continue;

    const rowKey = rowParts.join(' - ');
    const colKey = colParts.length > 0 ? colParts.join(' - ') : '';

    // Weight: use weight variable value or 1.0
    const weight = weightData ? (parseFloat(weightData[i]) || 0) : 1.0;

    if (!data.has(rowKey)) data.set(rowKey, new Map());
    const rowMap = data.get(rowKey)!;
    rowMap.set(colKey, (rowMap.get(colKey) || 0) + weight);
  }

  // ── Build PivotResult ──
  const effectiveColHeaders = colHeaders.length > 0 ? colHeaders : [''];
  const pivotRows: PivotRow[] = [];
  const colTotals = new Array<number>(effectiveColHeaders.length).fill(0);
  let grandTotal = 0;

  for (const rowKey of rowHeaders) {
    const values: number[] = [];
    let rowTotal = 0;

    for (let ci = 0; ci < effectiveColHeaders.length; ci++) {
      const colKey = effectiveColHeaders[ci];
      const val = data.get(rowKey)?.get(colKey) || 0;
      values.push(val);
      rowTotal += val;
      colTotals[ci] += val;
    }

    grandTotal += rowTotal;
    pivotRows.push({ key: rowKey, values, total: rowTotal });
  }

  return {
    rows: pivotRows,
    columnHeaders: effectiveColHeaders,
    rowHeaders,
    grandTotals: { columns: colTotals, grand: grandTotal },
  };
}

// ─── Percentage transformation ───────────────────────────────────────────────

/**
 * Transforms a `PivotResult` to express values as percentages.
 *
 * This is a **second-pass** transformation applied after the base
 * computation. The original `PivotResult` is not mutated.
 *
 * @param result - The base pivot result with raw aggregated values
 * @param mode - How to express percentages: 'row', 'column', or 'total'
 * @returns A new `PivotResult` with percentage values (0–100)
 */
export function applyPercentageMode(
  result: PivotResult,
  mode: 'row' | 'column' | 'total',
): PivotResult {
  const { rows, columnHeaders, rowHeaders, grandTotals } = result;
  const colCount = columnHeaders.length;

  const newRows: PivotRow[] = rows.map((row) => {
    const newValues: number[] = new Array(colCount);

    for (let ci = 0; ci < colCount; ci++) {
      let divisor: number;
      switch (mode) {
        case 'row':
          divisor = row.total;
          break;
        case 'column':
          divisor = grandTotals.columns[ci];
          break;
        case 'total':
          divisor = grandTotals.grand;
          break;
      }
      newValues[ci] = divisor !== 0 ? (row.values[ci] / divisor) * 100 : 0;
    }

    const newTotal = newValues.reduce((sum, v) => sum + v, 0);
    return { key: row.key, values: newValues, total: newTotal };
  });

  // Recompute column totals for the percentage view
  const newColTotals = new Array<number>(colCount).fill(0);
  for (const row of newRows) {
    for (let ci = 0; ci < colCount; ci++) {
      newColTotals[ci] += row.values[ci];
    }
  }
  const newGrand = newColTotals.reduce((sum, v) => sum + v, 0);

  return {
    rows: newRows,
    columnHeaders,
    rowHeaders,
    grandTotals: { columns: newColTotals, grand: newGrand },
  };
}

// ─── Empty result helper ─────────────────────────────────────────────────────

function emptyResult(): PivotResult {
  return {
    rows: [],
    columnHeaders: [],
    rowHeaders: [],
    grandTotals: { columns: [], grand: 0 },
  };
}
