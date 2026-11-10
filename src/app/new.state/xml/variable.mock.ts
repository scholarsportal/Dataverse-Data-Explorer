import { Category, Variable } from './xml.interface';

export function makeVariable(
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

// DDI <labl> is optional; Dataverse omits it for unlabelled variables.
export function withoutVariableLabel(variable: Variable): Variable {
  const { labl: _labl, ...rest } = variable;
  return rest as unknown as Variable;
}

// fast-xml-parser's raw output for a variable with exactly one <catgry>.
export function withSingleCategoryObject(variable: Variable): Variable {
  return {
    ...variable,
    catgry: variable.catgry[0] as unknown as Category[],
  };
}
