import assert from 'node:assert/strict';

const SECTION_SELECTORS = [
  '.crc-heading__en',
  '.crc-heading__zh',
  '.crc-heading__title',
];
const NEWS_SELECTOR = '.news__section-title';
const SECTION_TOKEN = '--fs-section-heading';
const SUBSECTION_TOKEN = '--fs-subsection-heading';
const CANONICAL_SECTION_VALUE = 'clamp(2.5rem,5vw,4rem)';
const CANONICAL_SUBSECTION_VALUE = 'clamp(1.5rem,2vw,1.75rem)';

function maskComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' '));
}

function findMatchingBrace(css, openIndex) {
  let depth = 1;
  let quote = '';

  for (let index = openIndex + 1; index < css.length; index += 1) {
    const character = css[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '{') depth += 1;
    if (character === '}') depth -= 1;
    if (depth === 0) return index;
  }

  assert.fail(`Unclosed CSS block at offset ${openIndex}`);
}

function splitTopLevel(value, delimiter) {
  const parts = [];
  let start = 0;
  let parentheses = 0;
  let brackets = 0;
  let quote = '';

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '(') parentheses += 1;
    else if (character === ')') parentheses -= 1;
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets -= 1;
    else if (character === delimiter && parentheses === 0 && brackets === 0) {
      parts.push(value.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(value.slice(start));
  return parts;
}

function declarationColon(declaration) {
  let parentheses = 0;
  let quote = '';

  for (let index = 0; index < declaration.length; index += 1) {
    const character = declaration[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '(') parentheses += 1;
    else if (character === ')') parentheses -= 1;
    else if (character === ':' && parentheses === 0) return index;
  }
  return -1;
}

function parseDeclarations(body) {
  const declarations = new Map();
  for (const chunk of splitTopLevel(body, ';')) {
    const colon = declarationColon(chunk);
    if (colon === -1) continue;
    const property = chunk.slice(0, colon).trim().toLowerCase();
    const value = chunk.slice(colon + 1).trim().replace(/\s*!important\s*$/i, '');
    if (property && value) declarations.set(property, value);
  }
  return declarations;
}

function nextBlockDelimiter(css, start, end) {
  let parentheses = 0;
  let brackets = 0;
  let quote = '';

  for (let index = start; index < end; index += 1) {
    const character = css[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '(') parentheses += 1;
    else if (character === ')') parentheses -= 1;
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets -= 1;
    else if ((character === '{' || character === ';') && parentheses === 0 && brackets === 0) {
      return { character, index };
    }
  }
  return null;
}

function parseRules(css, start = 0, end = css.length, insideMaxWidth = false, rules = []) {
  let cursor = start;
  let preludeStart = start;

  while (cursor < end) {
    const delimiter = nextBlockDelimiter(css, cursor, end);
    if (!delimiter) break;
    if (delimiter.character === ';') {
      cursor = delimiter.index + 1;
      preludeStart = cursor;
      continue;
    }

    const prelude = css.slice(preludeStart, delimiter.index).trim();
    const closeIndex = findMatchingBrace(css, delimiter.index);
    assert.ok(closeIndex < end, `CSS block at offset ${delimiter.index} crosses its parent block`);

    if (prelude.startsWith('@')) {
      const nestedMaxWidth = insideMaxWidth
        || (/^@media\b/i.test(prelude) && /\bmax-width\s*:/i.test(prelude));
      parseRules(css, delimiter.index + 1, closeIndex, nestedMaxWidth, rules);
    } else if (prelude) {
      rules.push({
        declarations: parseDeclarations(css.slice(delimiter.index + 1, closeIndex)),
        insideMaxWidth,
        offset: delimiter.index,
        selectors: splitTopLevel(prelude, ',').map(selector => selector.trim()).filter(Boolean),
      });
    }

    cursor = closeIndex + 1;
    preludeStart = cursor;
  }

  return rules;
}

function rightmostCompound(selector) {
  let boundary = 0;
  let parentheses = 0;
  let brackets = 0;
  let quote = '';

  for (let index = 0; index < selector.length; index += 1) {
    const character = selector[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '(') parentheses += 1;
    else if (character === ')') parentheses -= 1;
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets -= 1;
    else if (parentheses === 0 && brackets === 0 && /[\s>+~]/.test(character)) boundary = index + 1;
  }

  return selector.slice(boundary).trim();
}

function compoundHasClass(compound, selector) {
  const className = selector.slice(1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^\\w-])\\.${className}(?![\\w-])`).test(compound);
}

function selectorTargets(selector) {
  const compound = rightmostCompound(selector);
  return [...SECTION_SELECTORS, NEWS_SELECTOR].filter(target => compoundHasClass(compound, target));
}

function targetSelectors(rule, candidates) {
  const found = new Set();
  for (const selector of rule.selectors) {
    for (const target of selectorTargets(selector)) {
      if (candidates.includes(target)) found.add(target);
    }
  }
  return [...found];
}

function targetsInheritedRoot(selector) {
  const compound = rightmostCompound(selector);
  return /(?:^|[^\w-]):root(?![\w-])/.test(compound)
    || /^(?:html|body)(?:$|[.#:\[])/i.test(compound);
}

function normalizeValue(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

function minimumRem(value, customProperties, seen = new Set()) {
  const normalized = value.trim().toLowerCase();
  const rem = normalized.match(/^(-?(?:\d+\.?\d*|\.\d+))rem$/);
  if (rem) return Number.parseFloat(rem[1]);

  const pixels = normalized.match(/^(-?(?:\d+\.?\d*|\.\d+))px$/);
  if (pixels) return Number.parseFloat(pixels[1]) / 16;

  const nonNegativeFluidLength = normalized.match(/^(?:\d+\.?\d*|\.\d+)(?:vw|vh|vmin|vmax|%)$/);
  if (nonNegativeFluidLength) return 0;

  const variable = normalized.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (variable) {
    const name = variable[1];
    if (seen.has(name) || !customProperties.has(name)) return null;
    return minimumRem(customProperties.get(name), customProperties, new Set([...seen, name]));
  }

  const clamp = normalized.match(/^clamp\(([\s\S]*)\)$/);
  if (clamp) {
    const [minimum] = splitTopLevel(clamp[1], ',');
    return minimum === undefined ? null : minimumRem(minimum, customProperties, seen);
  }

  const maximum = normalized.match(/^max\(([\s\S]*)\)$/);
  if (maximum) {
    const candidates = splitTopLevel(maximum[1], ',').map(candidate => (
      minimumRem(candidate, customProperties, seen)
    ));
    if (candidates.length < 2 || candidates.some(candidate => candidate === null)) return null;
    return Math.max(...candidates);
  }

  const calculation = normalized.match(/^calc\(([\s\S]*)\)$/);
  if (calculation) {
    if (splitTopLevel(calculation[1], '-').length > 1) return null;
    const terms = splitTopLevel(calculation[1], '+');
    if (terms.length < 2) return null;
    const minima = terms.map(term => minimumRem(term, customProperties, seen));
    if (minima.some(minimum => minimum === null) || minima.slice(1).some(minimum => minimum < 0)) return null;
    return minima[0];
  }

  return null;
}

function assertMinimumFontSize(value, minimum, selector, customProperties, context) {
  const resolved = minimumRem(value, customProperties);
  assert.notEqual(
    resolved,
    null,
    `${context}: ${selector} font-size ${value} has no demonstrable rem minimum`,
  );
  assert.ok(
    resolved >= minimum,
    `${context}: ${selector} font-size ${value} falls below ${minimum}rem`,
  );
}

function containsEvery(selectors, expected) {
  return expected.every(selector => selectors.includes(selector));
}

export function assertApprovedHeadingScale(css, context = 'stylesheet') {
  const rules = parseRules(maskComments(css));
  const customProperties = new Map();
  for (const rule of rules) {
    if (rule.insideMaxWidth || !rule.selectors.includes(':root')) continue;
    for (const [property, value] of rule.declarations) {
      if (property.startsWith('--')) customProperties.set(property, value);
    }
  }

  assert.equal(
    normalizeValue(customProperties.get(SECTION_TOKEN) ?? ''),
    CANONICAL_SECTION_VALUE,
    `${context}: canonical ${SECTION_TOKEN} must equal ${CANONICAL_SECTION_VALUE}`,
  );
  assert.equal(
    normalizeValue(customProperties.get(SUBSECTION_TOKEN) ?? ''),
    CANONICAL_SUBSECTION_VALUE,
    `${context}: canonical ${SUBSECTION_TOKEN} must equal ${CANONICAL_SUBSECTION_VALUE}`,
  );

  const sharedIndex = rules.findIndex(rule => (
    containsEvery(rule.selectors, SECTION_SELECTORS)
    && rule.declarations.has('font-size')
    && rule.declarations.has('font-weight')
  ));
  assert.notEqual(sharedIndex, -1, `${context}: missing shared locale/title heading rule`);

  const sharedRule = rules[sharedIndex];
  assert.equal(
    normalizeValue(sharedRule.declarations.get('font-size')),
    `var(${SECTION_TOKEN})`,
    `${context}: canonical grouped heading font-size must consume var(${SECTION_TOKEN})`,
  );
  assert.equal(
    normalizeValue(sharedRule.declarations.get('font-weight')),
    '700',
    `${context}: canonical grouped heading font-weight must equal 700`,
  );

  const newsIndex = rules.findIndex(rule => (
    rule.selectors.includes(NEWS_SELECTOR) && rule.declarations.has('font-size')
  ));
  assert.notEqual(newsIndex, -1, `${context}: missing ${NEWS_SELECTOR} font-size`);
  assert.equal(
    normalizeValue(rules[newsIndex].declarations.get('font-size')),
    `var(${SUBSECTION_TOKEN})`,
    `${context}: canonical ${NEWS_SELECTOR} font-size must consume var(${SUBSECTION_TOKEN})`,
  );

  for (const [index, rule] of rules.entries()) {
    const sectionSelectors = targetSelectors(rule, SECTION_SELECTORS);
    const newsSelectors = targetSelectors(rule, [NEWS_SELECTOR]);
    const declaresSectionTypography = rule.declarations.has('font-size')
      || rule.declarations.has('font-weight');

    if (index > sharedIndex && sectionSelectors.length > 0 && declaresSectionTypography) {
      assert.equal(
        sectionSelectors.length,
        SECTION_SELECTORS.length,
        `${context}: later font-size/font-weight rule must treat locale/title headings equally: ${sectionSelectors.join(',')}`,
      );

      if (!rule.insideMaxWidth && rule.declarations.has('font-size')) {
        assert.equal(
          normalizeValue(rule.declarations.get('font-size')),
          `var(${SECTION_TOKEN})`,
          `${context}: later section heading font-size must consume var(${SECTION_TOKEN})`,
        );
      }
      if (rule.declarations.has('font-weight')) {
        assert.equal(
          normalizeValue(rule.declarations.get('font-weight')),
          '700',
          `${context}: later section heading font-weight must remain 700`,
        );
      }
    }

    if (
      index > newsIndex
      && !rule.insideMaxWidth
      && newsSelectors.length > 0
      && rule.declarations.has('font-size')
    ) {
      assert.equal(
        normalizeValue(rule.declarations.get('font-size')),
        `var(${SUBSECTION_TOKEN})`,
        `${context}: later news title font-size must consume var(${SUBSECTION_TOKEN})`,
      );
    }

    if (!rule.insideMaxWidth) continue;
    if (rule.declarations.has('font-size')) {
      for (const selector of sectionSelectors) {
        assertMinimumFontSize(
          rule.declarations.get('font-size'), 2.5, selector, customProperties, `${context} max-width media`,
        );
      }
      for (const selector of newsSelectors) {
        assertMinimumFontSize(
          rule.declarations.get('font-size'), 1.5, selector, customProperties, `${context} max-width media`,
        );
      }
    }

    const affectsInheritedHeadings = rule.selectors.some(targetsInheritedRoot);
    if (rule.declarations.has(SECTION_TOKEN) && (affectsInheritedHeadings || sectionSelectors.length > 0)) {
      assertMinimumFontSize(
        rule.declarations.get(SECTION_TOKEN), 2.5, SECTION_TOKEN, customProperties, `${context} max-width media`,
      );
    }
    if (rule.declarations.has(SUBSECTION_TOKEN) && (affectsInheritedHeadings || newsSelectors.length > 0)) {
      assertMinimumFontSize(
        rule.declarations.get(SUBSECTION_TOKEN), 1.5, SUBSECTION_TOKEN, customProperties, `${context} max-width media`,
      );
    }
  }
}
