import { selectDatasetAllVariableCategories } from './dataset.selectors';
import {
  makeVariable,
  withSingleCategoryObject,
} from '../xml/variable.mock';

describe('selectDatasetAllVariableCategories (issue #208)', () => {
  it('includes a variable with a single <catgry> parsed as a bare object', () => {
    const variables = {
      v1: withSingleCategoryObject(
        makeVariable('v1', 'cps25_property_1', [{ value: '1', freq: 13114 }]),
      ),
    };
    expect(selectDatasetAllVariableCategories.projector(variables)).toEqual({
      v1: { '1': 'label 1' },
    });
  });

  it('maps every category of a multi-category variable', () => {
    const variables = {
      v1: makeVariable('v1', 'PROV', [
        { value: '1', freq: 1 },
        { value: '2', freq: 2 },
      ]),
    };
    expect(selectDatasetAllVariableCategories.projector(variables)).toEqual({
      v1: { '1': 'label 1', '2': 'label 2' },
    });
  });
});
