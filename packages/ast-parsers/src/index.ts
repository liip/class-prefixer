import { Visitor } from 'estraverse';
import * as ts from 'typescript';

export { jsParser } from './js-parser';
export { tsParser } from './ts-parser';
export { loadTsConfig, isFunction } from './utils';

export type AstParserVisitors = Visitor | Visitor[] | undefined;
export type AstParserTsTransformers =
  | ts.TransformerFactory<ts.Node>
  | ts.TransformerFactory<ts.Node>[]
  | undefined;
