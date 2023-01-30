import base from '../../jest.base.config';

const id = 'class-prefixer-ast-visitor';
const root = `<rootDir>/packages/${id}`;

module.exports = {
  ...base,
  id,
  displayName: id,
  rootDir: '../..',
  roots: [root],
};
