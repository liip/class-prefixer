import { createTsTransformerWithConfig } from '../create-ts-transformer';

describe('createTsTransformerWithConfig', () => {
  it('should return a visitor factory function', () => {
    expect(createTsTransformerWithConfig({})).toBeInstanceOf(Function);
  });
});
