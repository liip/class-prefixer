import base from '../../jest.base.config';

const id = 'ast-parsers';
const root = `<rootDir>/packages/${id}`;

module.exports = {
  ...base,
  id,
  displayName: id,
  rootDir: '../..',
  roots: [root],
};
