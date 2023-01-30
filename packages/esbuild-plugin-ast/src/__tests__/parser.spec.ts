import { Visitor } from 'estraverse';

import { parser } from '../parser';

describe('parser', () => {
  const source = 'const value = 1;';

  it('should return the source if no valid visitor is provided', () => {
    expect(parser(source, {})).toBe(source);
  });

  it('should transform the source if visitor is a valid visitor object', () => {
    const visitor: Visitor = {
      enter: (node) => {
        if (node.type !== 'Literal') {
          return node;
        }

        return {
          ...node,
          value: 2,
          raw: '2',
        };
      },
    };

    expect(parser(source, visitor)).toMatch('const value = 2;');
  });
});
