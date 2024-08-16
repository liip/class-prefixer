# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.4.1](https://github.com/liip/class-prefixer/compare/@liip/esbuild-plugin-ast@0.4.0...@liip/esbuild-plugin-ast@0.4.1) (2024-08-16)

### Bug Fixes

- **rollup:** Correctly generate source maps ([cf22160](https://github.com/liip/class-prefixer/commit/cf22160b8f15486cc932bdff0b9cc5d2c92232ac))

# [0.4.0](https://github.com/liip/class-prefixer/compare/@liip/esbuild-plugin-ast@0.3.1...@liip/esbuild-plugin-ast@0.4.0) (2024-08-15)

### Features

- **rollup:** Add rollup plugin ([c26aa06](https://github.com/liip/class-prefixer/commit/c26aa060f4dcc38afac849288623b06c6ec41038))
- **ts:** Add Typescript parser support ([eaeaa79](https://github.com/liip/class-prefixer/commit/eaeaa7981327d0eb7cce8ad1842f0a984f5ecebd))

## [0.3.1](https://github.com/liip/class-prefixer/compare/@liip/esbuild-plugin-ast@0.3.0...@liip/esbuild-plugin-ast@0.3.1) (2024-01-30)

### Bug Fixes

- **ast-vue:** Handle js script deps via esbuild-plugin-ast ([a04e0e9](https://github.com/liip/class-prefixer/commit/a04e0e971761c567e5e184951c3515985d212067))

# [0.3.0](https://github.com/liip/class-prefixer/compare/@liip/esbuild-plugin-ast@0.2.0...@liip/esbuild-plugin-ast@0.3.0) (2023-10-12)

### chore

- Update dependencies ([159adde](https://github.com/liip/class-prefixer/commit/159adde0896c8ae292e18b4c9e97e300c58b0535))

### BREAKING CHANGES

- Update esbuild peer dependenciy on 0.19.x

# [0.2.0](https://github.com/liip/class-prefixer/compare/@liip/esbuild-plugin-ast@0.1.1...@liip/esbuild-plugin-ast@0.2.0) (2023-10-11)

### Bug Fixes

- **ast:** Allow parser to apply multiple visitors to on AST ([408bcc9](https://github.com/liip/class-prefixer/commit/408bcc9f72d8f5c73d87405bdfd721af9a9346de))
- **esbuild:** Exclude loaders file types from the parser ([fd6e080](https://github.com/liip/class-prefixer/commit/fd6e0806d9ab7e246948daa463125fad914fdeaa))

### BREAKING CHANGES

- **ast:** `visitor` esbuild plugin option has been renamed to `visitors`

## [0.1.1](https://github.com/liip/class-prefixer/compare/@liip/esbuild-plugin-ast@0.1.0...@liip/esbuild-plugin-ast@0.1.1) (2023-07-05)

### Bug Fixes

- **deps:** Update peerDependencies ([2ad3c7e](https://github.com/liip/class-prefixer/commit/2ad3c7e461ed73601b6e168356acb331ca3468c9))

# 0.1.0 (2023-07-05)

**Note:** Version bump only for package @liip/esbuild-plugin-ast

# 0.1.0-alpha.0 (2023-07-04)

### Features

- **esbuild:** create plugins and AST parsers ([c89fe59](https://github.com/liip/class-prefixer/commit/c89fe59c1de5f0aac98da74dfb4d2289e88f608c))
