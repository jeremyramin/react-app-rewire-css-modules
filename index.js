'use strict';
const cloneDeep = require('lodash.clonedeep');
const defaultsDeep = require('lodash.defaultsdeep');

const { loaderNameMatches } = require('react-app-rewired');
const deepFreeze = require('./deepFreeze');

const CSS_FILE_MATCHER = /\.css$/;
const CSS_MODULE_FILE_MATCHER = /\.module\.css$/;

const SASS_FILE_MATCHER = /\.s[ac]ss$/;
const SASS_MODULE_FILE_MATCHER = /\.module\.s[ac]ss$/;

const DEFAULT_OPTIONS = deepFreeze({
  sass: false,
  loaderOptions: {
    modules: true,
    localIdentName: '[local]___[hash:base64:5]'
  }
});

/**
 * Finds the children of a given rule.
 *
 * @param {Object} rule the rule to inspect
 * @returns {Array<Object>} the children of the given rule or an empty array
 */
const getRuleChildren = (rule) => {
  if (rule.use) {
    return rule.use;
  } else if (rule.oneOf) {
    return rule.oneOf;
  } else if (Array.isArray(rule.loader)) {
    return rule.loader;
  } else {
    return [];
  }
};

/**
 * A callback that checks if the given rule matches some condition.
 *
 * @callback ruleMatcher
 * @param {Object} rule the rule to test
 * @returns {boolean} true if the given rule matches some criteria, false
 *  otherwise
 */

/**
 * Find the rule that matches with the given rule matcher. The index of the rule
 * is returned with the containing Array.
 *
 * @param {(Object | Array<Object>)} rulesSource a rule or collection of rules
 * @param {ruleMatcher} ruleMatcher the callback that identifies the target rule
 * @returns {?{index: Number, rules: Array<Object>}} the index of the target
 *  rule and the rule's containing Array
 */
const findIndexAndRules = (rulesSource, ruleMatcher) => {
  let result = null;
  const rules =
      Array.isArray(rulesSource) ? rulesSource : getRuleChildren(rulesSource);
  rules.some((rule, index) => {
    if (ruleMatcher(rule)) {
      return (result = {index, rules});
    } else {
      return (result = findIndexAndRules(rule, ruleMatcher));
    }
  });
  return result;
};

/**
 * Find the first target rule identified by the rule matcher.
 *
 * @param {(Object | Array<Object>)} rulesSource a rule or collection of rules
 * @param {ruleMatcher} ruleMatcher the callback that identifies the target rule
 * @returns {Object} the target rule
 */
const findRule = (rulesSource, ruleMatcher) => {
  const {index, rules} = findIndexAndRules(rulesSource, ruleMatcher);
  return rules[index];
};

/**
 * Injects the given value after the target rule identified by the rule matcher.
 *
 * @param {(Object | Array<Object>)} rulesSource a rule or collection of rules
 * @param {ruleMatcher} ruleMatcher the callback that identifies the target rule
 * @param {Object} value the value to insert after the target rule
 */
const addAfterRule = (rulesSource, ruleMatcher, value) => {
  const {index, rules} = findIndexAndRules(rulesSource, ruleMatcher);
  rules.splice(index + 1, 0, value);
};

/**
 * Injects the given value before the target rule identified by the rule
 * matcher.
 *
 * @param {(Object | Array<Object>)} rulesSource a rule or collection of rules
 * @param {ruleMatcher} ruleMatcher the callback that identifies the target rule
 * @param {Object} value the value to insert after the target rule
 */
const addBeforeRule = (rulesSource, ruleMatcher, value) => {
  const {index, rules} = findIndexAndRules(rulesSource, ruleMatcher);
  rules.splice(index, 0, value);
};

/**
 * Compares two regular expressions for equality.
 *
 * @param {RegExp} one the first regular expression to compare
 * @param {RegExp} two the second regular expression to compare
 * @returns {boolean} true if the regular expressions are equivalent, false
 *  otherwise
 */
const isRegexEqual = (one, two) => {
  return (one instanceof RegExp) && (two instanceof RegExp)
      && (one.source === two.source) && (one.global === two.global)
      && (one.ignoreCase === two.ignoreCase)
      && (one.multiline === two.multiline);
};

/**
 * Returns a rule matcher that can be used to see if a rule has a loader name
 * that matches the given loader name.
 *
 * @param loaderName the name of the target loader
 * @returns {ruleMatcher} a rule matcher that compares using the given loader
 *  name
 */
const createLoaderMatcher = (loaderName) => {
  return (rule) => loaderNameMatches(rule, loaderName);
};

/** @function ruleMatcher */
const cssRuleMatcher = (rule) => isRegexEqual(rule.test, CSS_FILE_MATCHER);
/** @function ruleMatcher */
const cssLoaderMatcher = createLoaderMatcher('css-loader');
/** @function ruleMatcher */
const postcssLoaderMatcher = createLoaderMatcher('postcss-loader');
/** @function ruleMatcher */
const fileLoaderMatcher = createLoaderMatcher('file-loader');

module.exports = (config, env, options = {}) => {
  const overriddenOptions = defaultsDeep({}, options, DEFAULT_OPTIONS);

  const cssRule = findRule(config.module.rules, cssRuleMatcher);
  const sassRule = cloneDeep(cssRule);
  const cssModulesRule = cloneDeep(cssRule);

  cssRule.exclude = CSS_MODULE_FILE_MATCHER;

  cssModulesRule.test = CSS_MODULE_FILE_MATCHER;
  const cssModulesRuleCssLoader = findRule(cssModulesRule, cssLoaderMatcher);
  cssModulesRuleCssLoader.options = Object.assign({},
      cssModulesRuleCssLoader.options, overriddenOptions.loaderOptions);
  addBeforeRule(config.module.rules, fileLoaderMatcher, cssModulesRule);

  if (overriddenOptions.sass) {
    sassRule.test = SASS_FILE_MATCHER;
    sassRule.exclude = SASS_MODULE_FILE_MATCHER;
    addAfterRule(sassRule, postcssLoaderMatcher,
        require.resolve('sass-loader'));
    addBeforeRule(config.module.rules, fileLoaderMatcher, sassRule);

    const sassModulesRule = cloneDeep(cssModulesRule);
    sassModulesRule.test = SASS_MODULE_FILE_MATCHER;
    addAfterRule(sassModulesRule, postcssLoaderMatcher,
        require.resolve('sass-loader'));
    addBeforeRule(config.module.rules, fileLoaderMatcher, sassModulesRule);
  }

  return config;
};
