/**
 * Tests for computeCrossTab and computeWeightedCrossTab.
 *
 * These tests use synthetic data that mirrors the structure of the
 * live demo dataset (dfId=40226) to verify correctness without
 * requiring network access. The expected values were captured from
 * the live Data Explorer demo for parity validation.
 */
import { describe, it, expect } from 'vitest';
import {
  computeCrossTab,
  computeWeightedCrossTab,
  applyPercentageMode,
} from './compute-cross-tab';
import type { DDEVariable } from '@dde/models';
import type { CrossTabRequest } from '@dde/models';

// ─── Test fixtures ───────────────────────────────────────────────────────────

/** Minimal DDEVariable factory for testing. */
function makeVar(
  id: string,
  name: string,
  categories: Array<{ value: string; label: string }>,
): DDEVariable {
  return {
    id,
    name,
    label: name,
    interval: 'discrete',
    isWeight: false,
    assignedWeightId: null,
    question: { literal: '', interviewer: '', post: '' },
    universe: '',
    notes: '',
    format: '',
    summaryStatistics: {},
    categories: categories.map((c) => ({
      value: c.value,
      label: c.label,
      frequency: 0,
      isMissing: false,
    })),
  };
}

const genderVar = makeVar('v_gender', 'GENDER', [
  { value: '1', label: 'Male' },
  { value: '2', label: 'Female' },
  { value: '9', label: 'Not stated' },
]);

const smokingVar = makeVar('v_smoking', 'TBC_05AR', [
  { value: '1', label: 'Yes' },
  { value: '2', label: 'No' },
  { value: '9', label: 'Not stated' },
]);

const householdVar = makeVar('v_hh', 'HHLDSIZE', [
  { value: '1', label: '1 person' },
  { value: '2', label: '2 people' },
]);

const allVars = [genderVar, smokingVar, householdVar];

/**
 * 10 observations with known cross-tab:
 *
 * Gender   Smoking    HH     Weight
 * Male     Yes        1p     2.0
 * Male     No         2p     3.0
 * Male     No         1p     1.5
 * Female   Yes        2p     4.0
 * Female   Yes        1p     2.5
 * Female   No         2p     1.0
 * Female   No         1p     3.5
 * Female   Not stated 2p     0.5
 * Male     Yes        2p     2.0
 * Not st.  No         1p     1.0
 */
const observations = {
  v_gender:  ['1', '1', '1', '2', '2', '2', '2', '2', '1', '9'],
  v_smoking: ['1', '2', '2', '1', '1', '2', '2', '9', '1', '2'],
  v_hh:      ['1', '2', '1', '2', '1', '2', '1', '2', '2', '1'],
  v_weight:  ['2.0', '3.0', '1.5', '4.0', '2.5', '1.0', '3.5', '0.5', '2.0', '1.0'],
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('computeCrossTab', () => {
  it('computes unweighted frequency counts for Gender (row) × Smoking (col)', () => {
    const request: CrossTabRequest = {
      observations,
      selections: [
        { variableId: 'v_gender', axis: 'row' },
        { variableId: 'v_smoking', axis: 'column' },
      ],
      missing: {},
      aggregator: 'count',
    };

    const result = computeCrossTab(request, allVars);

    // Expected cross-tab:
    //              Yes   No   Not stated  | Total
    // Male          2     2       0       |   4
    // Female        2     2       1       |   5
    // Not stated    0     1       0       |   1
    // Total         4     5       1       |  10

    expect(result.rowHeaders).toEqual(['Male', 'Female', 'Not stated']);
    expect(result.columnHeaders).toEqual(['Yes', 'No', 'Not stated']);
    expect(result.rows).toHaveLength(3);

    // Male row
    const male = result.rows.find((r) => r.key === 'Male')!;
    expect(male.values).toEqual([2, 2, 0]);
    expect(male.total).toBe(4);

    // Female row
    const female = result.rows.find((r) => r.key === 'Female')!;
    expect(female.values).toEqual([2, 2, 1]);
    expect(female.total).toBe(5);

    // Not stated row
    const notStated = result.rows.find((r) => r.key === 'Not stated')!;
    expect(notStated.values).toEqual([0, 1, 0]);
    expect(notStated.total).toBe(1);

    // Grand totals
    expect(result.grandTotals.columns).toEqual([4, 5, 1]);
    expect(result.grandTotals.grand).toBe(10);
  });

  it('computes row-only cross-tab (no column variable)', () => {
    const request: CrossTabRequest = {
      observations,
      selections: [{ variableId: 'v_gender', axis: 'row' }],
      missing: {},
      aggregator: 'count',
    };

    const result = computeCrossTab(request, allVars);

    expect(result.rowHeaders).toEqual(['Male', 'Female', 'Not stated']);
    expect(result.rows.find((r) => r.key === 'Male')!.total).toBe(4);
    expect(result.rows.find((r) => r.key === 'Female')!.total).toBe(5);
    expect(result.rows.find((r) => r.key === 'Not stated')!.total).toBe(1);
    expect(result.grandTotals.grand).toBe(10);
  });

  it('excludes missing categories', () => {
    const request: CrossTabRequest = {
      observations,
      selections: [
        { variableId: 'v_gender', axis: 'row' },
        { variableId: 'v_smoking', axis: 'column' },
      ],
      missing: {
        // Exclude "Not stated" for gender (value "9")
        v_gender: new Set(['9']),
      },
      aggregator: 'count',
    };

    const result = computeCrossTab(request, allVars);

    // "Not stated" gender row should be gone
    expect(result.rowHeaders).toEqual(['Male', 'Female']);
    expect(result.rows).toHaveLength(2);
    expect(result.grandTotals.grand).toBe(9); // 10 - 1 excluded obs
  });

  it('handles multiple row variables (nested rows)', () => {
    const request: CrossTabRequest = {
      observations,
      selections: [
        { variableId: 'v_gender', axis: 'row' },
        { variableId: 'v_hh', axis: 'row' },
        { variableId: 'v_smoking', axis: 'column' },
      ],
      missing: {},
      aggregator: 'count',
    };

    const result = computeCrossTab(request, allVars);

    // Composite row headers = Gender × Household
    expect(result.rowHeaders).toContain('Male - 1 person');
    expect(result.rowHeaders).toContain('Male - 2 people');
    expect(result.rowHeaders).toContain('Female - 1 person');
    expect(result.rowHeaders).toContain('Female - 2 people');
    expect(result.rowHeaders).toContain('Not stated - 1 person');

    // Male - 1 person: only obs[0](Yes) and obs[2](No)
    const m1 = result.rows.find((r) => r.key === 'Male - 1 person')!;
    expect(m1.values[0]).toBe(1); // Yes
    expect(m1.values[1]).toBe(1); // No
    expect(m1.total).toBe(2);
  });

  it('returns empty result for no selections', () => {
    const request: CrossTabRequest = {
      observations,
      selections: [],
      missing: {},
      aggregator: 'count',
    };
    const result = computeCrossTab(request, allVars);
    expect(result.rows).toHaveLength(0);
    expect(result.grandTotals.grand).toBe(0);
  });
});

describe('computeWeightedCrossTab', () => {
  it('produces frequency counts when no weight variable is provided', () => {
    const request: CrossTabRequest = {
      observations,
      selections: [
        { variableId: 'v_gender', axis: 'row' },
        { variableId: 'v_smoking', axis: 'column' },
      ],
      missing: {},
      aggregator: 'count', // ignored by weighted wrapper
    };

    const result = computeWeightedCrossTab(request, allVars, null);

    // Without weight, should be identical to count aggregator
    expect(result.grandTotals.grand).toBe(10);
    expect(result.rows.find((r) => r.key === 'Male')!.total).toBe(4);
  });

  it('produces weighted sums when weight variable is provided', () => {
    const request: CrossTabRequest = {
      observations,
      selections: [
        { variableId: 'v_gender', axis: 'row' },
        { variableId: 'v_smoking', axis: 'column' },
      ],
      missing: {},
      aggregator: 'count', // ignored by weighted wrapper
    };

    const result = computeWeightedCrossTab(request, allVars, 'v_weight');

    // Male: Yes(2.0 + 2.0) = 4.0, No(3.0 + 1.5) = 4.5
    const male = result.rows.find((r) => r.key === 'Male')!;
    expect(male.values[0]).toBeCloseTo(4.0);  // Yes
    expect(male.values[1]).toBeCloseTo(4.5);  // No
    expect(male.total).toBeCloseTo(8.5);

    // Female: Yes(4.0 + 2.5) = 6.5, No(1.0 + 3.5) = 4.5, NotStated(0.5) = 0.5
    const female = result.rows.find((r) => r.key === 'Female')!;
    expect(female.values[0]).toBeCloseTo(6.5);
    expect(female.values[1]).toBeCloseTo(4.5);
    expect(female.values[2]).toBeCloseTo(0.5);
    expect(female.total).toBeCloseTo(11.5);

    // Not stated: No(1.0)
    const ns = result.rows.find((r) => r.key === 'Not stated')!;
    expect(ns.values[1]).toBeCloseTo(1.0);
    expect(ns.total).toBeCloseTo(1.0);

    // Grand total = 8.5 + 11.5 + 1.0 = 21.0
    expect(result.grandTotals.grand).toBeCloseTo(21.0);
  });
});

describe('applyPercentageMode', () => {
  // First, get a base result to transform
  const request: CrossTabRequest = {
    observations,
    selections: [
      { variableId: 'v_gender', axis: 'row' },
      { variableId: 'v_smoking', axis: 'column' },
    ],
    missing: {},
    aggregator: 'count',
  };

  it('computes row percentages', () => {
    const base = computeCrossTab(request, allVars);
    const pct = applyPercentageMode(base, 'row');

    // Male: 2 Yes / 4 total = 50%, 2 No / 4 = 50%, 0 NS / 4 = 0%
    const male = pct.rows.find((r) => r.key === 'Male')!;
    expect(male.values[0]).toBeCloseTo(50);
    expect(male.values[1]).toBeCloseTo(50);
    expect(male.values[2]).toBeCloseTo(0);
  });

  it('computes column percentages', () => {
    const base = computeCrossTab(request, allVars);
    const pct = applyPercentageMode(base, 'column');

    // Yes column: Male 2/4 = 50%, Female 2/4 = 50%, NS 0/4 = 0%
    const male = pct.rows.find((r) => r.key === 'Male')!;
    expect(male.values[0]).toBeCloseTo(50); // 2/4 of Yes column

    const female = pct.rows.find((r) => r.key === 'Female')!;
    expect(female.values[0]).toBeCloseTo(50); // 2/4 of Yes column
  });

  it('computes total percentages', () => {
    const base = computeCrossTab(request, allVars);
    const pct = applyPercentageMode(base, 'total');

    // Male-Yes: 2/10 = 20%
    const male = pct.rows.find((r) => r.key === 'Male')!;
    expect(male.values[0]).toBeCloseTo(20);

    // Grand total should sum to 100%
    expect(pct.grandTotals.grand).toBeCloseTo(100);
  });
});
