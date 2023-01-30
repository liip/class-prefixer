import { classExpressionPrefixer } from '../class-expression-prefixer';
import { prefixer } from '../prefixer';

jest.mock('../prefixer', () => {
  return { prefixer: jest.fn() };
});

describe('parser', () => {
  const prefix = 'prefix-';

  const options = {
    prefix: { value: prefix },
  };

  beforeEach(() => {
    (prefixer as jest.Mock).mockClear();
  });

  it('should accept a string element', () => {
    const original = 'value';

    classExpressionPrefixer(original, options);

    expect(prefixer).toHaveBeenCalledTimes(1);
    expect(prefixer).toHaveBeenCalledWith('value', options);
  });

  it('should handle object', () => {
    const original = {
      value: true,
      'second-value': undefined,
    };

    classExpressionPrefixer(original, options);

    expect(prefixer).toHaveBeenCalledTimes(2);
    expect(prefixer).toHaveBeenNthCalledWith(1, 'value', options);
    expect(prefixer).toHaveBeenNthCalledWith(2, 'second-value', options);
  });

  it('should handle array of elements', () => {
    const original = [
      'value',
      {
        'second-value': true,
        thirdValue: undefined,
      },
      undefined,
    ];

    classExpressionPrefixer(original, options);

    expect(prefixer).toHaveBeenCalledTimes(3);
    expect(prefixer).toHaveBeenNthCalledWith(1, 'value', options);
    expect(prefixer).toHaveBeenNthCalledWith(2, 'second-value', options);
    expect(prefixer).toHaveBeenNthCalledWith(3, 'thirdValue', options);
  });

  it('should return the value if not supported', () => {
    // @ts-ignore
    const original: string = undefined;

    const result = classExpressionPrefixer(original, options);

    expect(prefixer).not.toHaveBeenCalled();
    expect(result).toBe(undefined);
  });
});
