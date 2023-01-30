import {
  selectorPrefixer,
  PrefixerOptions,
  ContainerOptions,
  TestConditions,
} from '@liip/class-prefixer-core';
import { parse, stringify, SelectorNodeType } from 'css-selector-tokenizer';
import { Plugin, Node, AnyNode, AtRule, Rule } from 'postcss';

type Directive = 'container' | 'prefix';

type MayBeDirective = Directive | string;

type ActiveDirectives = Directive[];

type NodeTypeTests<T extends { type: string }, P extends string> = Extract<
  T,
  Record<'type', P>
>['type'] extends infer N extends string
  ? {
      [K in N]?: TestConditions;
    }
  : never;

const pluginName = 'class-prefixer';

const disableCommentRegex = new RegExp(
  `^(?:${pluginName}-disable)(?:\\s?([a-z]*))$`,
);

const endCommentRegex = new RegExp(
  `^(?:${pluginName}-enable)(?:\\s?([a-z]*))$`,
);

const PLUGIN_META_KEY = 'classPrefixer';

const DEFAULT_DIRECTIVE = ['container', 'prefix'] as const;

/**
 * Test a value against an array of either string or regexp
 */
function testForValue(value: string, tests: TestConditions) {
  if (!Array.isArray(tests)) {
    return false;
  }

  for (const test of tests) {
    if (
      (typeof test === 'string' && value.includes(test)) ||
      (test instanceof RegExp && test.test(value))
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Test an node name or content to see if it matches the provided value
 */
function testNodeValue<T extends SelectorNodeType>(
  node: T,
  tests: NodeTypeTests<T, T['type']>,
) {
  const testValue = tests[node.type];

  if (!testValue) {
    return false;
  }

  let value;

  if ('name' in node) {
    value = node.name;
  } else if ('content' in node) {
    value = node.content;
  }

  if (testValue.length > 0 && value) {
    return testForValue(value, testValue);
  }

  return false;
}

/**
 * A Generator function used to loop through the entire
 * nodes tree. Useful for nested loop.
 */
function* nodesIterator(nodes: SelectorNodeType[]) {
  let index = 0;

  while (index < nodes.length) {
    yield nodes[index++];
  }
}

/**
 * Check if the current selector can be safely contained (e.g. not already
 * contained, not root element,etc.)
 */
function getContainerPosition(
  selectorNodes: SelectorNodeType[],
  { value, preserveRoots = {}, excludes = {} }: ContainerOptions,
) {
  const nodes = nodesIterator(selectorNodes);

  let index = 0;
  let node;

  /**
   * Check if the selector must be excluded from the containerization.
   * We also check if selector is already contained, either with `.container .some-class`
   * or `.container.some-class`
   */
  if (
    (selectorNodes[0].type === 'class' && selectorNodes[0].name === value) ||
    testNodeValue(selectorNodes[0], excludes)
  ) {
    return -1;
  }

  /**
   * Loop through selector's nodes to correctly place the container
   * in case a `preserveRoot` has been defined
   */
  while ((node = nodes.next().value)) {
    if (node.type === 'class' && node.name === value) {
      return -1;
    }

    /**
     * We obviously don't account for spacing nodes
     */
    if (node.type === 'spacing') {
      index += 1;
      continue;
    }

    /**
     * Test node to check if it needs to be preserved
     */
    if (testNodeValue(node, preserveRoots)) {
      index += 1;

      /**
       * If there is a node that must be kept at the root of the selector, we also check
       * for compound selector as in `[dir='rtl'].class`, where we want to output
       * `[dir='rtl'].class .prefix` and not `[dir='rtl'] .prefix .class`
       */
      while ((node = nodes.next().value)) {
        /**
         * We reach the end of the current selector section and can insert
         * the container here
         */
        if (node.type === 'spacing') {
          break;
        }

        index += 1;
      }

      continue;
    }

    break;
  }

  return index;
}

/**
 * Add the container before each selector passed in the `value` argument.
 * The argument can contains a list of comma separated selectors.
 */
function addContainer(value: string, container: ContainerOptions) {
  const selectors = parse(value);

  /**
   * Add the container on each selector
   */
  selectors.nodes = selectors.nodes.map((selector) => {
    const containerPosition = getContainerPosition(selector.nodes, container);

    if (containerPosition === -1) {
      return selector;
    }

    const nodes = [...selector.nodes];

    nodes.splice(
      containerPosition,
      0,
      { type: 'spacing', value: ' ' },
      {
        type: 'class',
        name: container.value,
      },
      { type: 'spacing', value: ' ' },
    );

    return {
      ...selector,
      nodes,
    };
  });

  return stringify(selectors);
}

/**
 * Determine if the provided node can be prefixed and / or contained
 */
function parseAndPrefixSelector(
  node: Rule,
  { prefix, container }: PrefixerOptions,
) {
  const { parsed, directives = [] } = getPluginMeta(node);

  /**
   * Rule nodes can be called multiple time when other plugins modifies
   * their values. We then need a way to avoid infinite loop when this
   * plugin modify a node.
   */
  if (parsed) {
    return;
  }

  let prefixedSelector = node.selector;

  /**
   * If we have a `prefix` option value and the `prefix` directive
   * is not set, we then parse and prefix the current node selector
   */
  if (prefix?.value && !directives.includes('prefix')) {
    const excludes = [...(prefix.excludes || [])];

    if (container?.value) {
      excludes.push(container.value);
    }

    prefixedSelector = selectorPrefixer(node.selector, {
      prefix: {
        value: prefix.value,
        excludes: [...new Set(excludes)],
      },
    });
  }

  /**
   * If we have a `container` option value and the `container` directive
   * is not set, we then parse and add the container the current node selector
   */
  if (container?.value && !directives.includes('container')) {
    prefixedSelector = addContainer(prefixedSelector, container);
  }

  /**
   * Save node metadata to avoid infinite loop
   */
  setPluginMeta(node, { parsed: true, directives });

  /**
   * Actually set the node selector with the modified one
   */
  node.selector = prefixedSelector;
}

/**
 * Retrieve the node plugin metadata and parse the stringified
 * directive before returning the values
 */
function getPluginMeta(node: Node): NodeMeta {
  const meta: SerializeNodeMeta = node.raws[PLUGIN_META_KEY] || {};
  let directives: Directive[] = [];

  if (meta.directives) {
    directives = JSON.parse(meta.directives);
  }

  return { ...meta, directives };
}

type NodeMeta = {
  parsed?: boolean;
  directives?: Directive[];
};

type SerializeNodeMeta = {
  parsed?: boolean;
  directives?: string;
};

/**
 * Save meta data in the node `raws` property. The property is
 * stringified during the PostCSS process and we need to handle
 * the directives array ourself to properly encode the values.
 */
function setPluginMeta(node: Node, meta: NodeMeta) {
  let directives = '[]';

  if (meta.directives) {
    directives = JSON.stringify(meta.directives);
  }

  node.raws[PLUGIN_META_KEY] = { ...meta, directives };

  return node;
}

/**
 * A curried function used to update a node directive array. The plugin
 * will use those directives to know when to add prefix and / or container
 */
const createDirectiveUpdater =
  (directives: ActiveDirectives) =>
  (node: Node): false | void => {
    const meta = getPluginMeta(node);
    const currentDirectives = meta.directives || [];

    meta.directives = [...new Set([...currentDirectives, ...directives])];

    return setPluginMeta(node, meta) ? undefined : false;
  };

function isDirective<T extends MayBeDirective, MayBeDirective>(
  defaultDirectives: ReadonlyArray<T>,
  mayBeDirective: MayBeDirective,
): mayBeDirective is T {
  return defaultDirectives.includes(mayBeDirective as T);
}

export = (options: PrefixerOptions): Plugin => ({
  postcssPlugin: pluginName,
  Comment: (comment) => {
    /**
     * Early returns with a quick string comparison to avoid regexp
     * evaluation overhead
     */
    if (!comment.text.includes(pluginName)) {
      return;
    }

    const disableMatches = disableCommentRegex.exec(comment.text);

    if (disableMatches !== null) {
      const [_, directive] = [...disableMatches] as [string, MayBeDirective];

      let disableDirectives: ActiveDirectives;

      /**
       * If the directive is specified and known, we simply add it to the directives
       * array for further access. If not specified, we want to disable both the prefix
       * and the container functionalities. If the specified directive is not known,
       * we don't disable anything and display a warning to the user.
       */
      if (directive === '') {
        disableDirectives = ['container', 'prefix'];
      } else if (isDirective(DEFAULT_DIRECTIVE, directive)) {
        disableDirectives = [directive];
      } else {
        /* eslint-disable-next-line no-console */
        console.warn(
          `[ClassPrefixer PostCSS plugin]: The specified directive is not known by the plugin. Either ${DEFAULT_DIRECTIVE.join(
            ' or ',
          )} should be used but you provided ${directive}. You can omit the directive to entirely disable the plugin.`,
        );
        return;
      }

      let node: AnyNode | undefined = comment;

      /**
       * Create an "updater" function with the current comment directives
       * used for all the sibling nodes
       */
      const updateDirectives = createDirectiveUpdater(disableDirectives);

      /**
       * Loop through all the siblings of the current comment node
       */
      while ((node = node.next()) !== undefined) {
        /**
         * If the node is a comment, we must check for a potential `enable` one
         */
        if (node.type === 'comment' && comment.text.includes(pluginName)) {
          const endMatches = endCommentRegex.exec(node.text);

          /**
           * If this is actually a `enable` comment, we stop the iteration
           */
          if (endMatches && endMatches[1] === disableMatches[1]) {
            break;
          }
        }

        /**
         * If the current node is an `AtRule` or a `Rule`, we want to add required
         * metadata to be able to add prefix and / or container later on
         */
        if (node.type === 'rule' || node.type === 'atrule') {
          updateDirectives(node);
          node.walkRules(updateDirectives);
          node.walkAtRules(updateDirectives);
        }
      }
    }
  },
  Rule: (rule) => {
    if (
      rule.parent &&
      rule.parent.type === 'atrule' &&
      (rule.parent as AtRule).name === 'keyframes'
    ) {
      return;
    }

    parseAndPrefixSelector(rule, options);
  },
});
