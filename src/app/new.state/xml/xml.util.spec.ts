/// <reference types="jasmine" />

import {
  applyImportedMetadata,
  changeWeightForSelectedVariables,
  createNewVariables,
  datasetVariableIDs,
  findGroupClashes,
  fullyChangeMultipleVariables,
  IMPORTED_GROUP_LABEL_PREFIX,
  normalizeGroupVariables,
  updateGroups,
} from './xml.util';
import { makeVariable, withoutVariableLabel } from './variable.mock';
import { toArray } from '../../shared/util/array';
import {
  Category,
  ddiJSONStructure,
  ImportVariableFormTemplate,
  MatchVariables,
  SummaryStatistic,
  Variable,
  VariableGroup,
} from './xml.interface';

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

  // This dataset's data: '01' carries weights 2 + 3, '02' carries 4.
  const data = { v1: ['01', '01', '02'], vNEW: ['2', '3', '4'] };

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

  function weightedValues(variable: Variable): (string | number | undefined)[] {
    return toArray(variable.catgry).map(
      (category) => statsOf(category).find((stat) => stat['@_wgtd'])?.['#text'],
    );
  }

  it("computes weighted frequencies from this dataset's data, never the file's", () => {
    const [v1, vNEW] = currentDataset();
    // The file's numbers describe another dataset, and old DE exports
    // serialised "01" as 1.
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [
        { value: '1', freq: 999 },
        { value: '2', freq: 888 },
      ]),
      { '1': 123.5, '2': 45.25 },
      'vOLD',
    );
    const { variables, unmatchedWeights, uncomputedWeights } =
      createNewVariables(
        match(v1, imported, weightMatch),
        [v1, vNEW],
        weightOnly,
        data,
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
      { '#text': 5, '@_type': 'freq', '@_wgtd': 'wgtd', '@_wgt-var': 'vNEW' },
    ]);
    expect(second).toEqual([
      { '#text': 10, '@_type': 'freq' },
      { '#text': 4, '@_type': 'freq', '@_wgtd': 'wgtd', '@_wgt-var': 'vNEW' },
    ]);
    expect(unmatchedWeights).toEqual([]);
    expect(uncomputedWeights).toEqual([]);
  });

  it('keeps the variable order of the dataset', () => {
    const [v1, vNEW] = currentDataset();
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [{ value: '01', freq: 0 }]),
      { '01': 1 },
      'vOLD',
    );
    const { variables } = createNewVariables(
      match(v1, imported, weightMatch),
      [vNEW, v1],
      weightOnly,
      data,
    );
    expect(variables.map((variable) => variable['@_ID'])).toEqual([
      'vNEW',
      'v1',
    ]);
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
      data,
    );
    expect(variables[0]['@_wgt-var']).toBe('vNEW');
    expect(weightedValues(variables[0])).toEqual([5, 4]);
    expect(unmatchedWeights).toEqual([]);
  });

  it('uses a weight named only on the weighted catStat', () => {
    const [v1, vNEW] = currentDataset();
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [{ value: '01', freq: 0 }]),
      { '01': 1 },
      'vOLD',
    );
    imported['@_wgt-var'] = '';
    const { variables } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, vNEW],
      weightOnly,
      data,
    );
    expect(variables[0]['@_wgt-var']).toBe('vNEW');
    expect(weightedValues(variables[0])).toEqual([5, 4]);
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
    const { variables, unmatchedWeights, uncomputedWeights } =
      createNewVariables(match(v1, imported), [v1, vNEW], weightOnly, data);
    const updated = variables[0];
    expect(updated['@_wgt-var']).toBe('');
    updated.catgry.forEach((category) => {
      expect(Array.isArray(category.catStat)).toBe(false);
      expect(statsOf(category).some((stat) => stat['@_wgtd'])).toBe(false);
    });
    expect(unmatchedWeights).toEqual([
      { variableID: 'v1', variableName: 'REGION6', importedWgtVar: 'vMISSING' },
    ]);
    expect(uncomputedWeights).toEqual([]);
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
      data,
    );
    const updated = variables[0];
    expect(updated['@_wgt-var']).toBe('');
    expect(updated.catgry.map((category) => category.catStat)).toEqual([
      { '#text': 20, '@_type': 'freq' },
      { '#text': 10, '@_type': 'freq' },
    ]);
  });

  it('replaces stale weighted stats already on the current variable', () => {
    const [v1, vNEW] = currentDataset();
    withWeightedStats(v1, { '01': 700, '02': 800 }, 'vNEW');
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [{ value: '01', freq: 0 }]),
      { '01': 1 },
      'vOLD',
    );
    const { variables } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, vNEW],
      weightOnly,
      data,
    );
    expect(variables[0].catgry.map((category) => statsOf(category).length)).toEqual(
      [2, 2],
    );
    expect(weightedValues(variables[0])).toEqual([5, 4]);
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
      data,
    );
    const updated = variables[0];
    expect(updated.catgry.map((category) => category.catValu)).toEqual([
      '01',
      '02',
    ]);
    expect(weightedValues(updated)).toEqual([5, 4]);
  });

  it('gives a category that never occurs in the data a weighted frequency of zero', () => {
    const v1 = makeVariable('v1', 'REGION6', [
      { value: '01', freq: 20 },
      { value: '96', freq: 0 },
    ]);
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [{ value: '01', freq: 0 }]),
      { '01': 1 },
      'vOLD',
    );
    const { variables, uncomputedWeights } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, makeVariable('vNEW', 'WEIGHT', [])],
      weightOnly,
      data,
    );
    expect(weightedValues(variables[0])).toEqual([5, 0]);
    expect(uncomputedWeights).toEqual([]);
  });

  it('keeps the assignment but reports the variable when the weight data is unavailable', () => {
    const [v1, vNEW] = currentDataset();
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [{ value: '01', freq: 0 }]),
      { '01': 99 },
      'vOLD',
    );
    const { variables, uncomputedWeights } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, vNEW],
      weightOnly,
      // no data loaded for either variable
    );
    expect(variables[0]['@_wgt-var']).toBe('vNEW');
    expect(weightedValues(variables[0])).toEqual([undefined, undefined]);
    expect(uncomputedWeights).toEqual([
      { variableID: 'v1', variableName: 'REGION6' },
    ]);
  });

  it("reports the variable when the weight data is loaded but the variable's own data is not", () => {
    const [v1, vNEW] = currentDataset();
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [{ value: '01', freq: 0 }]),
      { '01': 99 },
      'vOLD',
    );
    const { variables, uncomputedWeights } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, vNEW],
      weightOnly,
      { vNEW: ['2', '3', '4'] },
    );
    expect(weightedValues(variables[0])).toEqual([undefined, undefined]);
    expect(uncomputedWeights.map((entry) => entry.variableID)).toEqual(['v1']);
  });

  it('reports the variable when none of its category codes occur in the data', () => {
    const [v1, vNEW] = currentDataset();
    const imported = withWeightedStats(
      makeVariable('i1', 'REGION6', [{ value: '01', freq: 0 }]),
      { '01': 99 },
      'vOLD',
    );
    const { variables, uncomputedWeights } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, vNEW],
      weightOnly,
      { v1: ['x', 'y', 'z'], vNEW: ['2', '3', '4'] },
    );
    expect(weightedValues(variables[0])).toEqual([undefined, undefined]);
    expect(uncomputedWeights).toEqual([
      { variableID: 'v1', variableName: 'REGION6' },
    ]);
  });

  it('does not report a weighted variable that has no categories', () => {
    const income = makeVariable('v2', 'INCOME', []);
    const imported = makeVariable('i2', 'INCOME', [], { '@_wgt-var': 'vOLD' });
    const { variables, uncomputedWeights } = createNewVariables(
      match(income, imported, weightMatch),
      [income, makeVariable('vNEW', 'WEIGHT', [])],
      weightOnly,
      data,
    );
    expect(variables[0]['@_wgt-var']).toBe('vNEW');
    expect(uncomputedWeights).toEqual([]);
  });

  it('tolerates a category with no <catStat>', () => {
    const v1 = makeVariable('v1', 'REGION6', [], {
      catgry: [
        {
          catValu: '01',
          labl: { '#text': 'One', '@_level': 'category' },
        } as unknown as Category,
      ],
    });
    const imported = makeVariable('i1', 'REGION6', [], { '@_wgt-var': 'vOLD' });
    const { variables } = createNewVariables(
      match(v1, imported, weightMatch),
      [v1, makeVariable('vNEW', 'WEIGHT', [])],
      weightOnly,
      data,
    );
    expect(statsOf(variables[0].catgry[0])).toEqual([
      { '#text': 5, '@_type': 'freq', '@_wgtd': 'wgtd', '@_wgt-var': 'vNEW' },
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
      data,
    );
    const [category] = toArray(variables[0].catgry);
    expect(category.catValu).toBe('01');
    expect(statsOf(category)[1]).toEqual({
      '#text': 5,
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
    const { variables, uncomputedWeights } = createNewVariables(
      match(v1, imported),
      [v1, vNEW],
      { ...weightOnly, weight: false, label: true },
      data,
    );
    expect(variables[0].catgry).toEqual(before);
    expect(uncomputedWeights).toEqual([]);
  });
});

describe('normalizeGroupVariables', () => {
  it('omits the var attribute when the list is empty or blank', () => {
    expect(normalizeGroupVariables({ '@_ID': 'VG1', labl: 'A', '@_var': '' })).toEqual({
      '@_ID': 'VG1',
      labl: 'A',
    });
    expect(
      normalizeGroupVariables({ '@_ID': 'VG1', labl: 'A', '@_var': '   ' }),
    ).toEqual({ '@_ID': 'VG1', labl: 'A' });
    expect(normalizeGroupVariables({ '@_ID': 'VG1', labl: 'A' })).toEqual({
      '@_ID': 'VG1',
      labl: 'A',
    });
  });

  it('trims, collapses and de-duplicates variable IDs', () => {
    expect(
      normalizeGroupVariables({
        '@_ID': 'VG1',
        labl: 'A',
        '@_var': ' v1  v2 v1 ',
      })['@_var'],
    ).toBe('v1 v2');
  });
});

describe('updateGroups (import)', () => {
  const matched: MatchVariables = {
    vNEW1: {
      importedVariableID: 'vOLD1',
      importedVariable: makeVariable('vOLD1', 'A', []),
    },
  };

  it('remaps matched variables to current-dataset IDs', () => {
    const [group] = updateGroups(
      [{ '@_ID': 'VG5', labl: 'Group', '@_var': 'vOLD1' }],
      matched,
      [],
    );
    expect(group['@_var']).toBe('vNEW1');
  });

  it('omits var for groups that are empty in the source or have no matched variables', () => {
    // Dataverse exports an empty group with no var attribute; serializing it
    // back as var="" made every save of the import fail with a 500.
    const groups: VariableGroup[] = updateGroups(
      [
        { '@_ID': 'VG5', labl: 'Empty in source' },
        { '@_ID': 'VG6', labl: 'Unmatched', '@_var': 'vOTHER' },
      ],
      matched,
      [],
    );
    expect(groups.length).toBe(2);
    groups.forEach((group) => {
      expect('@_var' in group).toBe(false);
    });
  });
});

describe('import group name clashes (issue #197)', () => {
  // Current variables v1..v6 are named A..F; the file's i1..i6 match by name.
  const names = ['A', 'B', 'C', 'D', 'E', 'F'];
  const currentVariables = names.map((name, index) =>
    makeVariable(`v${index + 1}`, name, []),
  );
  const matched: MatchVariables = Object.fromEntries(
    names.map((name, index) => [
      `v${index + 1}`,
      {
        importedVariableID: `i${index + 1}`,
        importedVariable: makeVariable(`i${index + 1}`, name, []),
      },
    ]),
  );

  // Two existing groups share the name "Demographics".
  function existing(): VariableGroup[] {
    return [
      { '@_ID': 'VG1', labl: 'Demographics', '@_var': 'v1 v2' },
      { '@_ID': 'VG2', labl: 'Demographics', '@_var': 'v3' },
      { '@_ID': 'VG3', labl: 'Health', '@_var': 'v4' },
      { '@_ID': 'VG4', labl: 'Only here', '@_var': 'v5' },
    ];
  }

  function imported(): VariableGroup[] {
    return [
      { '@_ID': 'VG1', labl: 'Demographics', '@_var': 'i1 i6' },
      { '@_ID': 'VG2', labl: 'Health', '@_var': 'i4' },
      { '@_ID': 'VG3', labl: 'Only in file', '@_var': 'i5' },
    ];
  }

  function summarize(groups: VariableGroup[]): string[] {
    return groups.map(
      (group) => `${group['@_ID']} ${group.labl}: ${group['@_var'] ?? ''}`,
    );
  }

  describe('findGroupClashes', () => {
    it('reports a name shared by several existing groups', () => {
      expect(
        findGroupClashes(imported(), existing(), matched, currentVariables),
      ).toEqual([
        {
          label: 'Demographics',
          existing: [
            { id: 'VG1', variableCount: 2, variableNames: ['A', 'B'] },
            { id: 'VG2', variableCount: 1, variableNames: ['C'] },
          ],
          imported: [{ id: '0', variableCount: 2, variableNames: ['A', 'F'] }],
        },
      ]);
    });

    it('reports a name shared by several imported groups', () => {
      const clashes = findGroupClashes(
        [
          { '@_ID': 'VG1', labl: 'Health', '@_var': 'i1' },
          { '@_ID': 'VG2', labl: 'Health', '@_var': 'i2' },
        ],
        existing(),
        matched,
        currentVariables,
      );
      expect(clashes.map((clash) => clash.label)).toEqual(['Health']);
      expect(clashes[0].existing.map((group) => group.id)).toEqual(['VG3']);
      expect(clashes[0].imported.map((group) => group.id)).toEqual(['0', '1']);
    });

    it('does not report a name used by exactly one group on each side', () => {
      const clashes = findGroupClashes(
        [{ '@_ID': 'VG9', labl: 'Health', '@_var': 'i4' }],
        existing(),
        matched,
        currentVariables,
      );
      expect(clashes).toEqual([]);
    });

    it('does not report a duplicated name that exists only in the file', () => {
      const clashes = findGroupClashes(
        [
          { '@_ID': 'VG1', labl: 'New', '@_var': 'i1' },
          { '@_ID': 'VG2', labl: 'New', '@_var': 'i2' },
        ],
        existing(),
        matched,
        currentVariables,
      );
      expect(clashes).toEqual([]);
    });

    it('compares names ignoring surrounding whitespace and label attributes', () => {
      const withAttributes = {
        '@_ID': 'VG1',
        labl: { '#text': ' Demographics ', '@_level': 'group' },
        '@_var': 'i1',
      } as unknown as VariableGroup;
      const clashes = findGroupClashes(
        [withAttributes],
        existing(),
        matched,
        currentVariables,
      );
      expect(clashes.map((clash) => clash.label)).toEqual(['Demographics']);
    });

    it('counts only the imported variables that exist in this dataset', () => {
      const [clash] = findGroupClashes(
        [{ '@_ID': 'VG1', labl: 'Demographics', '@_var': 'i1 iUNKNOWN' }],
        existing(),
        matched,
        currentVariables,
      );
      expect(clash.imported[0].variableCount).toBe(1);
    });
  });

  describe('updateGroups', () => {
    it('replaces every existing group when no choice is made', () => {
      expect(summarize(updateGroups(imported(), matched, existing()))).toEqual([
        'VG5 Demographics: v1 v6',
        'VG6 Health: v4',
        'VG7 Only in file: v5',
      ]);
    });

    it('replaces the clashing groups when the user chooses Replace', () => {
      const groups = updateGroups(imported(), matched, existing(), {
        Demographics: { action: 'replace' },
      });
      expect(summarize(groups)).toEqual([
        'VG5 Demographics: v1 v6',
        'VG6 Health: v4',
        'VG7 Only in file: v5',
      ]);
    });

    it('keeps both, prefixing the imported group, when the user chooses Keep both', () => {
      const groups = updateGroups(imported(), matched, existing(), {
        Demographics: { action: 'keepBoth' },
      });
      expect(summarize(groups)).toEqual([
        'VG1 Demographics: v1 v2',
        'VG2 Demographics: v3',
        `VG5 ${IMPORTED_GROUP_LABEL_PREFIX}Demographics: v1 v6`,
        'VG6 Health: v4',
        'VG7 Only in file: v5',
      ]);
    });

    it('adds the imported variables to the existing group the user picked', () => {
      const groups = updateGroups(imported(), matched, existing(), {
        Demographics: { action: 'merge', targets: { '0': 'VG2' } },
      });
      expect(summarize(groups)).toEqual([
        'VG1 Demographics: v1 v2',
        'VG2 Demographics: v3 v1 v6',
        'VG5 Health: v4',
        'VG6 Only in file: v5',
      ]);
    });

    it('does not duplicate a variable already in the merge target', () => {
      const groups = updateGroups(imported(), matched, existing(), {
        Demographics: { action: 'merge', targets: { '0': 'VG1' } },
      });
      expect(summarize(groups)[0]).toBe('VG1 Demographics: v1 v2 v6');
    });

    it('merges each imported group of a name into its own target', () => {
      const groups = updateGroups(
        [
          { '@_ID': 'VG1', labl: 'Demographics', '@_var': 'i5' },
          { '@_ID': 'VG2', labl: 'Demographics', '@_var': 'i6' },
        ],
        matched,
        existing(),
        {
          Demographics: {
            action: 'merge',
            targets: { '0': 'VG2', '1': 'VG1' },
          },
        },
      );
      expect(summarize(groups)).toEqual([
        'VG1 Demographics: v1 v2 v6',
        'VG2 Demographics: v3 v5',
      ]);
    });

    it('adds the imported group on its own when Merge has no valid target', () => {
      const groups = updateGroups(imported(), matched, existing(), {
        Demographics: { action: 'merge', targets: { '0': 'VG3' } },
      });
      expect(summarize(groups)).toEqual([
        'VG1 Demographics: v1 v2',
        'VG2 Demographics: v3',
        'VG5 Demographics: v1 v6',
        'VG6 Health: v4',
        'VG7 Only in file: v5',
      ]);
    });

    it('ignores a choice for a name that does not clash', () => {
      const groups = updateGroups(imported(), matched, existing(), {
        Health: { action: 'keepBoth' },
        'Only here': { action: 'merge', targets: { '0': 'VG4' } },
      });
      expect(summarize(groups)).toEqual([
        'VG5 Demographics: v1 v6',
        'VG6 Health: v4',
        'VG7 Only in file: v5',
      ]);
    });

    it('never reuses an existing group ID for an imported group', () => {
      const groups = updateGroups(imported(), matched, existing(), {
        Demographics: { action: 'keepBoth' },
      });
      const ids = groups.map((group) => group['@_ID']);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('does not mutate the existing groups it is given', () => {
      const before = existing();
      const snapshot = structuredClone(before);
      updateGroups(imported(), matched, before, {
        Demographics: { action: 'merge', targets: { '0': 'VG2' } },
      });
      expect(before).toEqual(snapshot);
    });
  });
});

describe('applyImportedMetadata (issue #197)', () => {
  const everything: ImportVariableFormTemplate = {
    groups: true,
    label: true,
    literalQuestion: true,
    interviewQuestion: true,
    postQuestion: true,
    universe: true,
    notes: true,
    weight: true,
  };

  function ddi(variables: Variable[], groups?: VariableGroup[]): ddiJSONStructure {
    return {
      codeBook: {
        dataDscr: { var: variables, ...(groups ? { varGrp: groups } : {}) },
      },
    } as ddiJSONStructure;
  }

  function current(): ddiJSONStructure {
    return ddi(
      [
        makeVariable('v1', 'PROV', [{ value: '1', freq: 3 }]),
        makeVariable('v2', 'AGE', []),
        makeVariable('v3', 'WEIGHT', []),
      ],
      [{ '@_ID': 'VG1', labl: 'Existing', '@_var': 'v1' }],
    );
  }

  function file(): ddiJSONStructure {
    return ddi(
      [
        makeVariable('i1', 'PROV', [{ value: '1', freq: 9 }], {
          '@_wgt-var': 'i9',
          labl: { '#text': 'Province (imported)', '@_level': 'variable' },
        }),
        makeVariable('i2', 'AGE', [], { '@_wgt-var': 'iGONE' }),
        makeVariable('i7', 'NOT_IN_DATASET', []),
        makeVariable('i9', 'WEIGHT', [], { '@_wgt': 'wgt' }),
      ],
      [{ '@_ID': 'VG7', labl: 'From file', '@_var': 'i1 i2' }],
    );
  }

  const data = { v1: ['1', '1'], v3: ['1.5', '2'] };

  it('applies the import and summarises what happened', () => {
    const result = applyImportedMetadata(current(), file(), everything, {
      crossTabValues: data,
    });
    expect(result?.summary).toEqual({
      variablesInFile: 4,
      variablesMatched: 3,
      groupsImported: 1,
      unmatchedWeights: [
        { variableID: 'v2', variableName: 'AGE', importedWgtVar: 'iGONE' },
      ],
      uncomputedWeights: [],
    });
    const variables = result!.dataset.codeBook.dataDscr.var;
    expect(variables[0].labl['#text']).toBe('Province (imported)');
    expect(variables[0]['@_wgt-var']).toBe('v3');
    expect(statsOf(variables[0].catgry[0])[1]['#text']).toBe(3.5);
    expect(variables[2]['@_wgt']).toBe('wgt');
    expect(result!.dataset.codeBook.dataDscr.varGrp).toEqual([
      { '@_ID': 'VG2', labl: 'From file', '@_var': 'v1 v2' },
    ]);
  });

  it('leaves the groups untouched when groups are not selected', () => {
    const result = applyImportedMetadata(
      current(),
      file(),
      { ...everything, groups: false },
      { crossTabValues: data },
    );
    expect(result?.summary.groupsImported).toBeNull();
    expect(result!.dataset.codeBook.dataDscr.varGrp).toEqual([
      { '@_ID': 'VG1', labl: 'Existing', '@_var': 'v1' },
    ]);
  });

  it('leaves the groups untouched when the file has no groups', () => {
    const withoutGroups = ddi(file().codeBook.dataDscr.var);
    const result = applyImportedMetadata(current(), withoutGroups, everything, {
      crossTabValues: data,
    });
    expect(result?.summary.groupsImported).toBeNull();
    expect(result!.dataset.codeBook.dataDscr.varGrp).toEqual([
      { '@_ID': 'VG1', labl: 'Existing', '@_var': 'v1' },
    ]);
  });

  it('applies the group choices it is given', () => {
    const dataset = ddi(current().codeBook.dataDscr.var, [
      { '@_ID': 'VG1', labl: 'From file', '@_var': 'v1' },
      { '@_ID': 'VG2', labl: 'From file', '@_var': 'v3' },
    ]);
    const result = applyImportedMetadata(dataset, file(), everything, {
      crossTabValues: data,
      groupResolutions: { 'From file': { action: 'keepBoth' } },
    });
    expect(
      (result!.dataset.codeBook.dataDscr.varGrp as VariableGroup[]).map(
        (group) => group.labl,
      ),
    ).toEqual(['From file', 'From file', 'DDE From file']);
  });

  it('returns null when the file has no variables', () => {
    expect(
      applyImportedMetadata(current(), {} as ddiJSONStructure, everything),
    ).toBeNull();
    expect(applyImportedMetadata(current(), ddi([]), everything)).toBeNull();
  });

  it('returns null when the dataset has no variables', () => {
    expect(applyImportedMetadata(ddi([]), file(), everything)).toBeNull();
  });

  it('does not mutate the dataset or the imported file', () => {
    const dataset = current();
    const imported = file();
    const datasetBefore = structuredClone(dataset);
    const importedBefore = structuredClone(imported);
    applyImportedMetadata(dataset, imported, everything, {
      crossTabValues: data,
    });
    expect(dataset).toEqual(datasetBefore);
    expect(imported).toEqual(importedBefore);
  });
});

describe('fullyChangeMultipleVariables (issue #208)', () => {
  const emptyForm = {
    label: '',
    literalQuestion: '',
    interviewQuestion: '',
    postQuestion: '',
    universe: '',
    notes: '',
  };

  it('does not throw for a variable with no <labl> when the bulk label is blank', () => {
    const unlabelled = withoutVariableLabel(
      makeVariable('v1', 'pes25_data_quality', [{ value: '1', freq: 3 }]),
    );
    let result: Variable[] = [];
    expect(() => {
      result = fullyChangeMultipleVariables([unlabelled], ['v1'], emptyForm);
    }).not.toThrow();
    expect(result[0].labl['#text']).toBe('');
  });

  it('keeps the existing label when the bulk label is blank', () => {
    const labelled = makeVariable('v1', 'REGION6', [{ value: '1', freq: 3 }]);
    const result = fullyChangeMultipleVariables([labelled], ['v1'], emptyForm);
    expect(result[0].labl['#text']).toBe('REGION6 label');
  });
});

describe('datasetVariableIDs', () => {
  function ddi(variables: unknown): ddiJSONStructure {
    return { codeBook: { dataDscr: { var: variables } } } as ddiJSONStructure;
  }

  it('lists the ID of every variable in file order', () => {
    const json = ddi([makeVariable('v1', 'A', []), makeVariable('v2', 'B', [])]);
    expect(datasetVariableIDs(json)).toEqual(['v1', 'v2']);
  });

  it('handles a single-variable file parsed as a bare object', () => {
    expect(datasetVariableIDs(ddi(makeVariable('v1', 'ONLY', [])))).toEqual([
      'v1',
    ]);
  });

  it('returns an empty list when the DDI has no variables', () => {
    expect(datasetVariableIDs(ddi(undefined))).toEqual([]);
    expect(datasetVariableIDs({} as ddiJSONStructure)).toEqual([]);
  });
});

describe('createNewVariables keeps existing metadata when the import is blank (issue #197)', () => {
  const template: ImportVariableFormTemplate = {
    groups: false,
    label: true,
    literalQuestion: false,
    interviewQuestion: false,
    postQuestion: false,
    universe: true,
    notes: true,
    weight: false,
  };
  const systemNote = {
    '#text': 'UNF:6:abc',
    '@_subject': 'Universal Numeric Fingerprint',
    '@_level': 'variable',
    '@_type': 'VDC:UNF',
  };

  function current(): Variable {
    return makeVariable('v1', 'PROV', [], {
      universe: 'All respondents',
      notes: [systemNote, 'curator note'],
    });
  }

  function importInto(imported: Variable): Variable {
    const { variables } = createNewVariables(
      { v1: { importedVariableID: imported['@_ID'], importedVariable: imported } },
      [current()],
      template,
    );
    return variables[0];
  }

  // What fast-xml-parser yields for a variable carrying only its attributes.
  function bare(overrides: { [key: string]: unknown } = {}): Variable {
    return { '@_ID': 'i1', '@_name': 'PROV', ...overrides } as unknown as Variable;
  }

  it('keeps the current label when the imported variable has none', () => {
    expect(importInto(bare()).labl['#text']).toBe('PROV label');
  });

  it('keeps the current label when the imported label is blank', () => {
    const imported = bare({ labl: { '#text': '  ', '@_level': 'variable' } });
    expect(importInto(imported).labl['#text']).toBe('PROV label');
  });

  it('imports a label written as plain text, without a level attribute', () => {
    const imported = bare({ labl: 'Province of residence' });
    expect(importInto(imported).labl).toEqual({
      '#text': 'Province of residence',
      '@_level': 'variable',
    });
  });

  it('imports a label written with a level attribute', () => {
    const imported = bare({
      labl: { '#text': 'Province (imported)', '@_level': 'variable' },
    });
    expect(importInto(imported).labl['#text']).toBe('Province (imported)');
  });

  it('keeps the current universe when the imported variable has none', () => {
    expect(importInto(bare()).universe).toBe('All respondents');
  });

  it('imports a universe when the file has one', () => {
    expect(importInto(bare({ universe: 'Adults 18+' })).universe).toBe(
      'Adults 18+',
    );
  });

  it('keeps the current note when the imported variable has none', () => {
    expect(importInto(bare()).notes).toEqual([systemNote, 'curator note']);
  });

  it('keeps the current note when the import carries only a system note', () => {
    expect(importInto(bare({ notes: systemNote })).notes).toEqual([
      systemNote,
      'curator note',
    ]);
  });

  it('imports a note stored beside a system note', () => {
    const imported = bare({ notes: [systemNote, 'imported note'] });
    expect(importInto(imported).notes).toEqual([systemNote, 'imported note']);
  });

  it('imports a note stored as plain text', () => {
    expect(importInto(bare({ notes: 'imported note' })).notes).toEqual([
      systemNote,
      'imported note',
    ]);
  });
});
