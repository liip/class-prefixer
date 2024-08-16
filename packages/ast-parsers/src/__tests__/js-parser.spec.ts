import { Visitor } from 'estraverse';

import { jsParser } from '../js-parser';

describe('jsParser', () => {
  const source = 'const value = 1;';
  const file = 'test.js';
  it('should return the source if no valid visitor is provided', () => {
    expect(jsParser({ source, file, visitors: {} }).code).toContain(source);
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

    expect(jsParser({ source, file, visitors: visitor }).code).toMatch(
      'const value = 2;',
    );
  });

  it('should transform the source if multiple visitor are passed', () => {
    const visitors: Visitor[] = [
      {
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
      },
      {
        enter: (node) => {
          if (node.type !== 'Identifier') {
            return node;
          }

          return {
            ...node,
            name: 'expected',
          };
        },
      },
    ];

    expect(jsParser({ source, file, visitors }).code).toMatch(
      'const expected = 2;',
    );
  });
});
