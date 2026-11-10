import { toArray } from './array';

describe('toArray', () => {
  it('returns an empty array for undefined and null', () => {
    expect(toArray(undefined)).toEqual([]);
    expect(toArray(null)).toEqual([]);
  });

  it('returns an existing array unchanged', () => {
    const values = [1, 2];
    expect(toArray(values)).toBe(values);
  });

  it('wraps a single value', () => {
    const value = { catValu: '1' };
    expect(toArray(value)).toEqual([value]);
  });
});
