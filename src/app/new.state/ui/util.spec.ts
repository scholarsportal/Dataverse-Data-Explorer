import { buildTable, generateCrossTabCSV } from './util';

type Observation = { [label: string]: string | number };

const HH = 'HHLDSIZE - Household size';
const SMK = 'TBC_05AR - Smoked cigarettes - lifetime';
const SEX = 'GENDER - Gender of person';
const AGE = 'AGE - Age group';

function obs(
  values: { [variable: string]: string },
  weight: number = 1,
): Observation {
  return { ...values, value: weight };
}

function repeat(observation: Observation, times: number): Observation[] {
  return Array.from({ length: times }, () => ({ ...observation }));
}

// The table part of the export: every line before the blank separator that
// precedes the footer.
function tableLines(csv: string): string[] {
  const lines = csv.split('\n');
  return lines.slice(0, lines.indexOf(''));
}

describe('generateCrossTabCSV (issue #191)', () => {
  it('writes each row variable in its own column', () => {
    const table = [
      obs({ [HH]: '4 people', [SMK]: 'No', [SEX]: 'Male' }),
      obs({ [HH]: '4 people', [SMK]: 'No', [SEX]: 'Male' }),
      obs({ [HH]: '4 people', [SMK]: 'Yes', [SEX]: 'Female' }),
      obs({ [HH]: '1 person', [SMK]: 'Yes', [SEX]: 'Female' }),
    ];
    const csv = generateCrossTabCSV({ rows: [HH, SMK], cols: [SEX], table });
    expect(tableLines(csv)).toEqual([
      `,${SEX},Female,Male`,
      `${HH},${SMK},,`,
      '1 person,Yes,1,0',
      '4 people,No,0,2',
      '4 people,Yes,1,0',
    ]);
  });

  it('keeps a category label that itself contains " - " in one cell', () => {
    const table = [
      obs({ [HH]: '1 - 2 people', [SMK]: 'Yes - daily', [SEX]: 'Male' }),
    ];
    const csv = generateCrossTabCSV({ rows: [HH, SMK], cols: [SEX], table });
    expect(tableLines(csv)[2]).toBe('1 - 2 people,Yes - daily,1');
  });

  it('writes one header row per column variable', () => {
    const table = [
      obs({ [HH]: '1 person', [SEX]: 'Male', [AGE]: 'Young' }),
      obs({ [HH]: '1 person', [SEX]: 'Female', [AGE]: 'Old' }),
      obs({ [HH]: '1 person', [SEX]: 'Female', [AGE]: 'Young' }),
      obs({ [HH]: '2 people', [SEX]: 'Female', [AGE]: 'Young' }),
    ];
    const csv = generateCrossTabCSV({ rows: [HH], cols: [SEX, AGE], table });
    expect(tableLines(csv)).toEqual([
      `${SEX},Female,Female,Male`,
      `${AGE},Old,Young,Young`,
      `${HH},,,`,
      '1 person,1,1,1',
      '2 people,0,1,0',
    ]);
  });

  it('sorts rows and columns naturally, like the on-screen table', () => {
    const table = [
      obs({ [HH]: '10 people', [SEX]: 'Male' }),
      obs({ [HH]: 'Not stated', [SEX]: 'Male' }),
      obs({ [HH]: '2 people', [SEX]: 'Female' }),
      obs({ [HH]: '1 person', [SEX]: 'Male' }),
    ];
    const lines = tableLines(
      generateCrossTabCSV({ rows: [HH], cols: [SEX], table }),
    );
    expect(lines[0]).toBe(`${SEX},Female,Male`);
    expect(lines.slice(2).map((line) => line.split(',')[0])).toEqual([
      '1 person',
      '2 people',
      '10 people',
      'Not stated',
    ]);
  });

  it('uses the supplied comparator for ordering', () => {
    const table = [
      obs({ [HH]: 'a', [SEX]: 'Male' }),
      obs({ [HH]: 'b', [SEX]: 'Male' }),
    ];
    const reversed = (a: string, b: string): number => b.localeCompare(a);
    const lines = tableLines(
      generateCrossTabCSV(
        { rows: [HH], cols: [SEX], table },
        { compare: reversed },
      ),
    );
    expect(lines.slice(2)).toEqual(['b,1', 'a,1']);
  });

  it('handles row variables only', () => {
    const table = [obs({ [HH]: '1 person' }), obs({ [HH]: '1 person' })];
    const csv = generateCrossTabCSV(
      { rows: [HH], cols: [], table },
      { valueLabel: 'Show Value' },
    );
    expect(tableLines(csv)).toEqual([`${HH},Show Value`, '1 person,2']);
  });

  it('handles column variables only', () => {
    const table = [obs({ [SEX]: 'Male' }), obs({ [SEX]: 'Female' })];
    const csv = generateCrossTabCSV(
      { rows: [], cols: [SEX], table },
      { valueLabel: 'Show Value' },
    );
    expect(tableLines(csv)).toEqual([`${SEX},Female,Male`, 'Show Value,1,1']);
  });

  it('quotes labels containing commas, quotes or line breaks', () => {
    const table = [obs({ [HH]: 'Yes, "often"', [SEX]: 'Male' })];
    const csv = generateCrossTabCSV({ rows: [HH], cols: [SEX], table });
    expect(tableLines(csv)[2]).toBe('"Yes, ""often""",1');
  });

  it('skips observations that lack a selected variable', () => {
    const table = [
      obs({ [HH]: '1 person', [SEX]: 'Male' }),
      obs({ [HH]: '1 person' }),
      obs({ [HH]: '', [SEX]: 'Male' }),
    ];
    const csv = generateCrossTabCSV({ rows: [HH], cols: [SEX], table });
    expect(tableLines(csv)).toEqual([
      `${SEX},Male`,
      `${HH},`,
      '1 person,1',
    ]);
  });

  it('reports the display mode and table size in the footer', () => {
    const table = [obs({ [HH]: '1 person', [SEX]: 'Male' })];
    const csv = generateCrossTabCSV(
      { rows: [HH], cols: [SEX], table },
      { mode: 'ROW_PERC', valueLabel: 'Row Percentage' },
    );
    const footer = csv.split('\n').slice(tableLines(csv).length + 1);
    expect(footer[0]).toMatch(/^"?Generated on: /);
    expect(footer.slice(1)).toEqual([
      'Values: Row Percentage',
      'Total Rows: 1',
      'Total Columns: 1',
    ]);
  });

  describe('weights', () => {
    it('sums weights instead of counting observations', () => {
      const table = [
        obs({ [HH]: '1 person', [SEX]: 'Male' }, 2.5),
        obs({ [HH]: '1 person', [SEX]: 'Male' }, 1.5),
      ];
      const csv = generateCrossTabCSV({ rows: [HH], cols: [SEX], table });
      expect(tableLines(csv)[2]).toBe('1 person,4');
    });

    it('counts a weight of zero as zero, not one', () => {
      const table = [
        obs({ [HH]: '1 person', [SEX]: 'Male' }, 2),
        obs({ [HH]: '1 person', [SEX]: 'Male' }, 0),
      ];
      const csv = generateCrossTabCSV({ rows: [HH], cols: [SEX], table });
      expect(tableLines(csv)[2]).toBe('1 person,2');
    });

    it('ignores a non-numeric weight but keeps the category', () => {
      const table = [
        obs({ [HH]: '1 person', [SEX]: 'Male' }, 3),
        obs({ [HH]: '2 people', [SEX]: 'Male' }, Number.NaN),
      ];
      const csv = generateCrossTabCSV({ rows: [HH], cols: [SEX], table });
      expect(tableLines(csv).slice(2)).toEqual(['1 person,3', '2 people,0']);
    });
  });

  describe('percentages (issue #190)', () => {
    // Counts:            Female  Male
    //   1 person            1      3
    //   2 people            2      2
    const table = [
      ...repeat(obs({ [HH]: '1 person', [SEX]: 'Female' }), 1),
      ...repeat(obs({ [HH]: '1 person', [SEX]: 'Male' }), 3),
      ...repeat(obs({ [HH]: '2 people', [SEX]: 'Female' }), 2),
      ...repeat(obs({ [HH]: '2 people', [SEX]: 'Male' }), 2),
    ];
    const data = { rows: [HH], cols: [SEX], table };

    it('exports counts by default', () => {
      expect(tableLines(generateCrossTabCSV(data)).slice(2)).toEqual([
        '1 person,1,3',
        '2 people,2,2',
      ]);
    });

    it('exports each cell as a share of its row', () => {
      const csv = generateCrossTabCSV(data, { mode: 'ROW_PERC' });
      expect(tableLines(csv).slice(2)).toEqual([
        '1 person,25.0%,75.0%',
        '2 people,50.0%,50.0%',
      ]);
    });

    it('exports each cell as a share of its column', () => {
      const csv = generateCrossTabCSV(data, { mode: 'COL_PERC' });
      expect(tableLines(csv).slice(2)).toEqual([
        '1 person,33.3%,60.0%',
        '2 people,66.7%,40.0%',
      ]);
    });

    it('exports each cell as a share of the grand total', () => {
      const csv = generateCrossTabCSV(data, { mode: 'TOTAL_PERC' });
      expect(tableLines(csv).slice(2)).toEqual([
        '1 person,12.5%,37.5%',
        '2 people,25.0%,25.0%',
      ]);
    });

    it('leaves a cell blank when its denominator is zero', () => {
      const zeroRow = [
        obs({ [HH]: '1 person', [SEX]: 'Male' }, 0),
        obs({ [HH]: '2 people', [SEX]: 'Male' }, 4),
      ];
      const csv = generateCrossTabCSV(
        { rows: [HH], cols: [SEX], table: zeroRow },
        { mode: 'ROW_PERC' },
      );
      expect(tableLines(csv).slice(2)).toEqual([
        '1 person,',
        '2 people,100.0%',
      ]);
    });
  });
});

describe('buildTable (cross-tab chart data)', () => {
  it('joins multi-variable keys for chart labels, in first-seen order', () => {
    const result = buildTable({
      rows: [HH, SMK],
      cols: [SEX],
      table: [
        obs({ [HH]: '4 people', [SMK]: 'No', [SEX]: 'Male' }),
        obs({ [HH]: '1 person', [SMK]: 'Yes', [SEX]: 'Female' }),
        obs({ [HH]: '4 people', [SMK]: 'No', [SEX]: 'Male' }),
      ],
    });
    expect(result.rows).toEqual(['4 people - No', '1 person - Yes']);
    expect(result.cols).toEqual(['Male', 'Female']);
    expect(result.table['4 people - No']['Male']).toBe(2);
    expect(result.table['1 person - Yes']['Female']).toBe(1);
  });

  it('counts a weight of zero as zero, not one', () => {
    const result = buildTable({
      rows: [HH],
      cols: [SEX],
      table: [
        obs({ [HH]: '1 person', [SEX]: 'Male' }, 2),
        obs({ [HH]: '1 person', [SEX]: 'Male' }, 0),
      ],
    });
    expect(result.table['1 person']['Male']).toBe(2);
  });
});
