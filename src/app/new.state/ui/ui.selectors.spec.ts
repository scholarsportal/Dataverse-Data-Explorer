import {
  selectOpenVariableChartTable,
  selectOpenVariableHasCategories,
  selectOpenVariableLabel,
} from './ui.selectors';
import { Category, Variable } from '../xml/xml.interface';
import {
  makeVariable,
  withSingleCategoryObject,
  withoutVariableLabel,
} from '../xml/variable.mock';

describe('selectOpenVariableLabel (issue #208)', () => {
  it('returns the variable label', () => {
    const variables = { v1: makeVariable('v1', 'PROV', []) };
    expect(selectOpenVariableLabel.projector('v1', variables)).toBe(
      'PROV label',
    );
  });

  it('returns an empty string when the variable has no <labl>', () => {
    const variables = {
      v1: withoutVariableLabel(
        makeVariable('v1', 'pes25_data_quality', [{ value: '1', freq: 5 }]),
      ),
    };
    expect(selectOpenVariableLabel.projector('v1', variables)).toBe('');
  });

  it('returns an empty string for an unknown variable', () => {
    expect(selectOpenVariableLabel.projector('missing', {})).toBe('');
  });
});

describe('selectOpenVariableChartTable (issue #208)', () => {
  function table(
    variables: { [id: string]: Variable },
    crossTab: { [id: string]: string[] } = {},
  ) {
    return selectOpenVariableChartTable.projector('v1', variables, [], crossTab);
  }

  it('builds a row from a single <catgry> parsed as a bare object', () => {
    const variable = withSingleCategoryObject(
      makeVariable('v1', 'cps25_property_1', [{ value: '1', freq: 13114 }]),
    );
    const chart = table({ v1: variable });
    expect(Object.keys(chart)).toEqual(['1']);
    expect(chart['1'].count).toBe('13114');
    expect(chart['1'].category).toBe('label 1');
    expect(selectOpenVariableHasCategories.projector(chart)).toBe(true);
  });

  it('builds rows for an unlabelled multi-category variable', () => {
    const variable = withoutVariableLabel(
      makeVariable('v1', 'pes25_data_quality', [
        { value: '1', freq: 12513 },
        { value: '2', freq: 139 },
      ]),
    );
    const chart = table({ v1: variable });
    expect(Object.keys(chart).sort()).toEqual(['1', '2']);
    expect(selectOpenVariableHasCategories.projector(chart)).toBe(true);
  });

  it('tolerates a category with no <catStat>', () => {
    const variable = makeVariable('v1', 'HRLYEARN', [], {
      catgry: [
        {
          catValu: '9999.97',
          labl: { '#text': 'DK', '@_level': 'category' },
        } as unknown as Category,
      ],
    });
    const chart = table({ v1: variable });
    expect(chart['9999.97'].count).toBe('None');
    expect(chart['9999.97'].weightedCount).toBe('None');
  });

  it('reads unweighted and weighted frequencies from a <catStat> array', () => {
    const variable = makeVariable('v1', 'PROV', [], {
      catgry: [
        {
          catValu: '1',
          labl: { '#text': 'One', '@_level': 'category' },
          catStat: [
            { '#text': '10', '@_type': 'freq' },
            {
              '#text': '12.5',
              '@_type': 'freq',
              '@_wgtd': 'wgtd',
              '@_wgt-var': 'w1',
            },
          ],
        },
      ],
    });
    const chart = table({ v1: variable });
    expect(chart['1'].count).toBe('10');
    expect(chart['1'].weightedCount).toBe('12.5');
  });

  it('falls back to cross-tab values when the variable has no categories', () => {
    const variable = makeVariable('v1', 'FREETEXT', [], {
      catgry: undefined as unknown as Category[],
    });
    const chart = table({ v1: variable }, { v1: ['a', 'a', 'b'] });
    expect(chart['a'].count).toBe('2');
    expect(chart['b'].count).toBe('1');
  });

  it('does not fall back to cross-tab values for REC_NUM', () => {
    const variable = makeVariable('v1', 'REC_NUM', [], {
      catgry: undefined as unknown as Category[],
    });
    const chart = table({ v1: variable }, { v1: ['1', '2'] });
    expect(selectOpenVariableHasCategories.projector(chart)).toBe(false);
  });
});
