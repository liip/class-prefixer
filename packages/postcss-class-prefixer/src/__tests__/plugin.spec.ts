import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import CleanCSS from 'clean-css';
import postcss from 'postcss';
import postcssNested from 'postcss-nested';

import { default as classPrefixer } from '../plugin';

const fixtureDir = join(__dirname, './fixtures');

describe('classPrefixer', () => {
  const prefix = {
    value: 'prefix-',
    excludes: ['excluded', /^reg-exclude/],
  };
  const container = {
    value: 'prefix',
    preserveRoots: {
      attribute: [/^dir=/],
    },
    excludes: {
      element: ['html', 'body'],
      'pseudo-class': ['root'],
      attribute: [/^data-exclude/],
    },
  };

  const cleanCSS = new CleanCSS({ returnPromise: true });

  let source: string;
  let sourceComments: string;
  let sourceNested: string;
  let outputPrefixed: string;
  let outputContained: string;
  let outputComments: string;
  let outputNested: string;

  function minify(source: string) {
    return cleanCSS.minify(source).then((output) => output.styles);
  }

  beforeAll(async () => {
    source = await readFile(resolve(fixtureDir, 'source.css'), 'utf-8');
    sourceComments = await readFile(
      resolve(fixtureDir, 'source-comments.css'),
      'utf-8',
    );
    sourceNested = await readFile(
      resolve(fixtureDir, 'source-nested.css'),
      'utf-8',
    );
    outputPrefixed = await readFile(
      resolve(fixtureDir, 'output-prefixed.css'),
      'utf-8',
    ).then(minify);
    outputContained = await readFile(
      resolve(fixtureDir, 'output-contained.css'),
      'utf-8',
    ).then(minify);
    outputComments = await readFile(
      resolve(fixtureDir, 'output-comments.css'),
      'utf-8',
    ).then(minify);
    outputNested = await readFile(
      resolve(fixtureDir, 'output-nested.css'),
      'utf-8',
    ).then(minify);
  });

  it('should prefix simple and compound class selectors', async () => {
    const { css } = postcss().use(classPrefixer({ prefix })).process(source);

    await expect(minify(css)).resolves.toEqual(outputPrefixed);
  });

  it('should not prefix simple and compound class selectors if already prefixed', async () => {
    const { css } = postcss()
      .use(classPrefixer({ prefix }))
      .process(outputPrefixed);

    await expect(minify(css)).resolves.toEqual(outputPrefixed);
  });

  it('should add a root container selector if specified', async () => {
    const { css } = postcss()
      .use(classPrefixer({ prefix, container }))
      .process(source);

    await expect(minify(css)).resolves.toEqual(outputContained);
  });

  it('should not add a root container selector if already present', async () => {
    const { css } = postcss()
      .use(classPrefixer({ prefix, container }))
      .process(outputContained);

    await expect(minify(css)).resolves.toEqual(outputContained);
  });

  it('should honors plugin comment annotations', async () => {
    const { css } = postcss()
      .use(classPrefixer({ prefix, container }))
      .process(sourceComments);

    await expect(minify(css)).resolves.toEqual(outputComments);
  });

  it('should works with nested selectors', async () => {
    const { css } = postcss()
      .use(postcssNested)
      .use(classPrefixer({ prefix, container }))
      .process(sourceNested);

    await expect(minify(css)).resolves.toEqual(outputNested);
  });
});
