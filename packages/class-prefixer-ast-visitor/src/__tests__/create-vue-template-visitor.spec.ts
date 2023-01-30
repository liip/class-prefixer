import { createVueTemplateVisitor } from '../create-vue-template-visitor';

describe('createVueTemplateVisitor', () => {
  it('should return a visitor object', () => {
    expect(createVueTemplateVisitor({})).toBeInstanceOf(Object);
  });
});
