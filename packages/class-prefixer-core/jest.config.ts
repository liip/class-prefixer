import base from '../../jest.base.config';

const id = 'class-prefixer-core';
const root = `<rootDir>/packages/${id}`;

module.exports = {
  ...base,
  id,
  displayName: id,
  rootDir: '../..',
  roots: [root],
};
