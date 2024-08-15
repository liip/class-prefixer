import base from '../../jest.base.config';

const id = 'rollup-plugin-ast-transform';
const root = `<rootDir>/packages/${id}`;

module.exports = {
  ...base,
  id,
  displayName: id,
  rootDir: '../..',
  roots: [root],
};
