import { prefixer } from '../prefixer';

describe('prefixer', () => {
  const prefix = 'prefix-';
  const excludes = ['excluded', /^is/];

  const options = {
    prefix: {
      value: prefix,
      excludes,
    },
  };

  it('should prefix a single value', () => {
    expect(prefixer('value', options)).toBe('prefix-value');
  });

  it('should prefix a string containing multiple class', () => {
    expect(prefixer('btn btn--small', options)).toBe(
      'prefix-btn prefix-btn--small',
    );
  });

  it('should not prefix a string if already prefixed', () => {
    expect(prefixer('prefix-btn btn--small', options)).toBe(
      'prefix-btn prefix-btn--small',
    );
  });

  it('should not prefix an empty string', () => {
    expect(prefixer('', options)).toBe('');
  });

  it('should returns the value if no prefix is provided', () => {
    expect(prefixer('value', {})).toBe('value');
  });

  it('should not prefix excluded values', () => {
    expect(prefixer('btn btn--excluded is-valid btn-is-valid', options)).toBe(
      'prefix-btn btn--excluded is-valid prefix-btn-is-valid',
    );
  });
});
