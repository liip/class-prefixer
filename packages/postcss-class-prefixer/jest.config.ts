import base from '../../jest.base.config';

const id = 'postcss-class-prefixer';
const root = `<rootDir>/packages/${id}`;

module.exports = {
  ...base,
  id,
  displayName: id,
  rootDir: '../..',
  roots: [root],
};
