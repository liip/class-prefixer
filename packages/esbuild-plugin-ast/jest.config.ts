import base from '../../jest.base.config';

const id = 'esbuild-plugin-ast';
const root = `<rootDir>/packages/${id}`;

module.exports = {
  ...base,
  id,
  displayName: id,
  rootDir: '../..',
  roots: [root],
};
