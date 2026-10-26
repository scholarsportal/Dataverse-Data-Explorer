/// <reference types="jasmine" />

import {
  changeWeightForSelectedVariables,
  createNewVariables,
} from './xml.util';
import {
  Category,
  ImportVariableFormTemplate,
  MatchVariables,
  SummaryStatistic,
  Variable,
} from './xml.interface';

function makeVariable(
  id: string,
  name: string,
  categories: { value: string; freq: number }[],
  overrides: Partial<Variable> = {},
): Variable {
  const catgry: Category[] = categories.map(({ value, freq }) => ({
    catValu: value,
    labl: { '#text': `label ${value}`, '@_level': 'category' },
    catStat: { '#text': freq, '@_type': 'freq' },
  }));
  return {
    location: { '@_fileid': 'f1' },
    labl: { '#text': `${name} label`, '@_level': 'variable' },
    qstn: { qstnLit: '' },
    universe: '',
    sumStat: [],
    catgry,
    varFormat: { '@_type': 'numeric' },
    notes: {
      '#text': 'system note',
      '@_subject': '',
      '@_level': '',
      '@_type': '',
    },
    '@_ID': id,
    '@_name': name,
    '@_intrvl': 'discrete',
    '@_wgt-var': '',
    ...overrides,
  };
}

function statsOf(category: Category): SummaryStatistic[] {
  return Array.isArray(category.catStat) ? category.catStat : [category.catStat];
}

describe('changeWeightForSelectedVariables', () => {
  it('computes weighted frequencies for zero-padded category codes', () => {
    const allVariables = {
      v1: makeVariable('v1', 'REGION6', [
        { value: '01', freq: 2 },
        { value: '02', freq: 1 },
        { value: '96', freq: 0 },
      ]),
      vw: makeVariable('vw', 'WEIGHT', []),
    };
    const crossTab = {
      v1: ['01', '01', '02'],
      vw: ['2', '3', '4'],
    };
    const result = changeWeightForSelectedVariables(
      allVariables,
      ['v1'],
      'vw',
      crossTab,
    );
    const updated = result.find((variable) => variable['@_ID'] === 'v1');
    expect(updated).toBeDefined();
    const categories = updated!.catgry;
    const weightedOf = (value: string) => {
      const category = categories.find((cat) => cat.catValu === value);
      expect(category).toBeDefined();
      return statsOf(category!).find((stat) => stat['@_wgtd']);
    };
    expect(weightedOf('01')?.['#text']).toBe(5);
    expect(weightedOf('02')?.['#text']).toBe(4);
    // Category absent from the data has a genuine weighted frequency of zero.
    expect(weightedOf('96')?.['#text']).toBe(0);
    expect(weightedOf('01')?.['@_wgt-var']).toBe('vw');
  });

  it('leaves a variable unweighted when no category code matches the data', () => {
    const allVariables = {
      v1: makeVariable('v1', 'BROKEN', [
        { value: '01', freq: 2 },
        { value: '02', freq: 1 },
      ]),
      vw: makeVariable('vw', 'WEIGHT', []),
    };
    const crossTab = {
      v1: ['x', 'y', 'z'],
      vw: ['2', '3', '4'],
    };
    const result = changeWeightForSelectedVariables(
      allVariables,
      ['v1'],
      'vw',
      crossTab,
    );
    const updated = result.find((variable) => variable['@_ID'] === 'v1');
    expect(updated).toBeDefined();
    updated!.catgry.forEach((category) => {
      expect(Array.isArray(category.catStat)).toBe(false);
      expect(statsOf(category).some((stat) => stat['@_wgtd'])).toBe(false);
    });
  });

  it('removes weighted stats when weightID is "remove"', () => {
    const weighted = makeVariable('v1', 'REGION6', [{ value: '01', freq: 2 }]);
    weighted.catgry[0].catStat = [
      { '#text': 2, '@_type': 'freq' },
      { '#text': 5, '@_type': 'freq', '@_wgtd': 'wgtd', '@_wgt-var': 'vw' },
    ];
    const result = changeWeightForSelectedVariables(
      { v1: weighted },
      ['v1'],
      'remove',
      {},
    );
    const category = result[0].catgry[0];
    expect(Array.isArray(category.catStat)).toBe(false);
    const [stat] = statsOf(category);
    expect(stat['@_wgtd']).toBeUndefined();
    expect(stat['@_wgt-var']).toBeUndefined();
    expect(stat['#text']).toBe(2);
  });

  it('writes no weighted stats when no weight is being applied (metadata-only saves)', () => {
    // The single-variable save path calls this with assignedWeight = ''.
    // It must never fabricate zero-frequency weighted stats with an empty
    // wgt-var reference.
    const allVariables = {
      v1: makeVariable('v1', 'REGION6', [
        { value: '01', freq: 2 },
        { value: '02', freq: 1 },
      ]),
    };
    const result = changeWeightForSelectedVariables(
      allVariables,
      ['v1'],
      '',
      { v1: ['01', '01', '02'] },
    );
    result[0].catgry.forEach((category) => {
      expect(Array.isArray(category.catStat)).toBe(false);
      expect(statsOf(category).some((stat) => stat['@_wgtd'])).toBe(false);
    });
  });

  it('skips non-numeric weight cells instead of producing NaN', () => {
    const allVariables = {
      v1: makeVariable('v1', 'VAR', [{ value: '01', freq: 3 }]),
      vw: makeVariable('vw', 'WEIGHT', []),
    };
    const crossTab = {
      v1: ['01', '01', '01'],
      vw: ['2', 'NA', '3'],
    };
    const result = changeWeightForSelectedVariables(
      allVariables,
      ['v1'],
      'vw',
      crossTab,
    );
    const updated = result.find((v) => v['@_ID'] === 'v1');
    expect(updated).toBeDefined();
    const weighted = statsOf(updated!.catgry[0]).find((stat) => stat['@_wgtd']);
    expect(weighted?.['#text']).toBe(5);
  });
});

describe('createNewVariables (import)', () => {
  const weightOnly: ImportVariableFormTemplate = {
    groups: false,
    label: false,
    literalQuestion: false,
    interviewQuestion: false,
    postQuestion: false,
    universe: false,
    notes: false,
    weight: true,
  };

  function withWeightedStats(
    variable: Variable,
    weighted: { [catValu: string]: number },
    wgtVar: string,
  ): Variable {
    variable.catgry.forEach((category) => {
      const value = weighted[category.catValu];
      if (value !== undefined) {
        category.catStat = [
          statsOf(category)[0],
          {
            '#text': value,
            '@_type': 'freq',
            '@_wgtd': 'wgtd',
            '@_wgt-var': wgtVar,
          },
        ];
      }
    });
    variable['@_wgt-var'] = wgtVar;
    return variable;
  }

  // Current dataset: v1 (REGION6, zero-padded codes) and weight vNEW.
  function currentDataset(): Variable[] {
    return [
      makeVariable('v1', 'REGION6', [
        { value: '01', freq: 20 },
        { value: '02', freq: 10 },
      ]),
      makeVariable('vNEW', 'WEIGHT', [], { '@_wgt': 'wgt' }),
    ];
  }

  function match(
    current: Variable,
    imported: Variable,
    extra: MatchVariables = {},
  ): MatchVariables {
    return {
      [current['@_ID']]: {
        importedVariableID: imported['@_ID'],
        importedVariable: imported,
      },
      ...extra,
    };
  }

  const importedWeight = makeVariable('vOLD', 'WEIGHT', [], {
    '@_wgt': 'wgt',
  });
  const weightMatch: MatchVariables = {
    vNEW: { importedVariableID: 'vOLD', importedVariable: importedWeight },
  };

  it('merges weighted stats onto current categories despite corrupted imported codes', () => {
    const [v1, vNEW] = currentDataset();
    // Old DE exports serialised "01" as 1.
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [
        { value: '1', freq: 999 },
        { value: '2', freq: 888 },
      ]),
      { '1': 123.5, '2': 45.25 },
      'vOLD',
    );
    const { variables, unmatchedWeights } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, vNEW],
      weightOnly,
    );
    const updated = variables.find((variable) => variable['@_ID'] === 'v1')!;
    expect(updated['@_wgt-var']).toBe('vNEW');
    expect(updated.catgry.map((category) => category.catValu)).toEqual([
      '01',
      '02',
    ]);
    expect(updated.catgry.map((category) => category.labl['#text'])).toEqual([
      'label 01',
      'label 02',
    ]);
    const [first, second] = updated.catgry.map(statsOf);
    expect(first).toEqual([
      { '#text': 20, '@_type': 'freq' },
      { '#text': 123.5, '@_type': 'freq', '@_wgtd': 'wgtd', '@_wgt-var': 'vNEW' },
    ]);
    expect(second[0]).toEqual({ '#text': 10, '@_type': 'freq' });
    expect(second[1]['#text']).toBe(45.25);
    expect(unmatchedWeights).toEqual([]);
  });

  it('uses the variable-level weight for Dataverse exports whose catStat has no wgt-var', () => {
    const [v1, vNEW] = currentDataset();
    // Dataverse's DDI export: <var wgt-var="vOLD"> with
    // <catStat wgtd="wgtd" type="freq"> and no per-stat wgt-var.
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [
        { value: '01', freq: 0 },
        { value: '02', freq: 0 },
      ]),
      { '01': 3.5, '02': 4.5 },
      'vOLD',
    );
    imported.catgry.forEach((category) => {
      statsOf(category).forEach((stat) => delete stat['@_wgt-var']);
    });
    const { variables, unmatchedWeights } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, vNEW],
      weightOnly,
    );
    const weighted = variables[0].catgry.map((category) =>
      statsOf(category).find((stat) => stat['@_wgtd']),
    );
    expect(weighted.map((stat) => stat?.['#text'])).toEqual([3.5, 4.5]);
    expect(weighted.map((stat) => stat?.['@_wgt-var'])).toEqual([
      'vNEW',
      'vNEW',
    ]);
    expect(unmatchedWeights).toEqual([]);
  });

  it('prefers an exact code match over a numeric one', () => {
    const v1 = makeVariable('v1', 'CODE', [
      { value: '1', freq: 5 },
      { value: '01', freq: 6 },
    ]);
    const imported = withWeightedStats(
      makeVariable('i1', 'CODE', [
        { value: '01', freq: 0 },
        { value: '1', freq: 0 },
      ]),
      { '01': 60, '1': 50 },
      'vOLD',
    );
    const { variables } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, makeVariable('vNEW', 'WEIGHT', [])],
      weightOnly,
    );
    const weighted = variables[0].catgry.map(
      (category) => statsOf(category).find((stat) => stat['@_wgtd'])?.['#text'],
    );
    expect(weighted).toEqual([50, 60]);
  });

  it('leaves categories unweighted and reports once when the weight variable has no match', () => {
    const [v1, vNEW] = currentDataset();
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [
        { value: '01', freq: 0 },
        { value: '02', freq: 0 },
      ]),
      { '01': 1, '02': 2 },
      'vMISSING',
    );
    const { variables, unmatchedWeights } = createNewVariables(
      match(v1, imported),
      [v1, vNEW],
      weightOnly,
    );
    const updated = variables[0];
    expect(updated['@_wgt-var']).toBe('');
    updated.catgry.forEach((category) => {
      expect(Array.isArray(category.catStat)).toBe(false);
      expect(statsOf(category).some((stat) => stat['@_wgtd'])).toBe(false);
    });
    expect(unmatchedWeights).toEqual([
      { variableID: 'v1', variableName: 'REGION6', importedWgtVar: 'vMISSING' },
    ]);
  });

  it('strips existing weighted stats when the imported variable is unweighted', () => {
    const [v1, vNEW] = currentDataset();
    withWeightedStats(v1, { '01': 7, '02': 8 }, 'vNEW');
    const imported = makeVariable('i1', 'REGION6', [
      { value: '01', freq: 1 },
      { value: '02', freq: 2 },
    ]);
    const { variables } = createNewVariables(
      match(v1, imported),
      [v1, vNEW],
      weightOnly,
    );
    const updated = variables[0];
    expect(updated['@_wgt-var']).toBe('');
    expect(updated.catgry.map((category) => category.catStat)).toEqual([
      { '#text': 20, '@_type': 'freq' },
      { '#text': 10, '@_type': 'freq' },
    ]);
  });

  it('ignores imported categories that do not exist in the current dataset', () => {
    const [v1, vNEW] = currentDataset();
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [
        { value: '01', freq: 0 },
        { value: '07', freq: 0 },
        { value: '96', freq: 0 },
      ]),
      { '01': 11, '07': 12, '96': 13 },
      'vOLD',
    );
    const { variables } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, vNEW],
      weightOnly,
    );
    const updated = variables[0];
    expect(updated.catgry.map((category) => category.catValu)).toEqual([
      '01',
      '02',
    ]);
    // '02' has no imported counterpart, so it stays unweighted.
    expect(statsOf(updated.catgry[1])).toEqual([
      { '#text': 10, '@_type': 'freq' },
    ]);
  });

  it('handles a single-category variable parsed as a bare object', () => {
    const v1 = makeVariable('v1', 'FLAG', [{ value: '01', freq: 4 }]);
    // fast-xml-parser yields an object, not an array, for one <catgry>.
    (v1 as unknown as { catgry: Category }).catgry = v1.catgry[0];
    const imported = withWeightedStats(
      makeVariable('i1', 'FLAG', [{ value: '1', freq: 0 }]),
      { '1': 9 },
      'vOLD',
    );
    const { variables } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, makeVariable('vNEW', 'WEIGHT', [])],
      weightOnly,
    );
    const category = variables[0].catgry as unknown as Category;
    expect(category.catValu).toBe('01');
    expect(statsOf(category)[1]).toEqual({
      '#text': 9,
      '@_type': 'freq',
      '@_wgtd': 'wgtd',
      '@_wgt-var': 'vNEW',
    });
  });

  it('does not touch categories when weights are not selected for import', () => {
    const [v1, vNEW] = currentDataset();
    withWeightedStats(v1, { '01': 7 }, 'vNEW');
    const before = structuredClone(v1.catgry);
    const imported = makeVariable('i1', 'REGION6', [{ value: '99', freq: 1 }]);
    const { variables } = createNewVariables(
      match(v1, imported),
      [v1, vNEW],
      { ...weightOnly, weight: false, label: true },
    );
    expect(variables[0].catgry).toEqual(before);
  });
});
