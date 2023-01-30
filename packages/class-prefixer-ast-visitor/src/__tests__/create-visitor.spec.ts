import { createVisitor } from '../create-visitor';

describe('createVisitor', () => {
  it('should return a visitor object', () => {
    expect(createVisitor({})).toBeInstanceOf(Object);
  });
});
