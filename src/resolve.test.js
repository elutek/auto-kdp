import { resolveAllValues } from './resolve';
import { makeMap } from './test-utils';

test('resolve_nochange', () => {
  expect(resolveAllValues(makeMap(), null)).toEqual(makeMap());
  expect(resolveAllValues(makeMap('a', 'b'), null)).toEqual(makeMap('a', 'b'));
  expect(resolveAllValues(makeMap('a', 'b${', 'c}', 'd'), null)).toEqual(makeMap('a', 'b${', 'c}', 'd'));
});

test('resolve_simple', () => {
  expect(resolveAllValues(
    makeMap('key1', 'xxx', 'key2', 'something ${key1}'), null)).toEqual(
      makeMap('key1', 'xxx', 'key2', 'something xxx'));
  expect(resolveAllValues(
    makeMap('key1', 'xxx', 'key2', '${key1} something'), null)).toEqual(
      makeMap('key1', 'xxx', 'key2', 'xxx something'));
  expect(resolveAllValues(
    makeMap('key1', 'xxx', 'key2', 'some${key1}thing'), null)).toEqual(
      makeMap('key1', 'xxx', 'key2', 'somexxxthing'));
});

test('resolve_nested_keys_level2', () => {
  expect(resolveAllValues(
    makeMap('k1', 'testing', 'k2', 'blah ${k1}', 'k3', 'more ${k2}'), null)).toEqual(
      makeMap('k1', 'testing', 'k2', 'blah testing', 'k3', 'more blah testing'));
  expect(resolveAllValues(
    makeMap('k3', 'more ${k2}', 'k2', 'blah ${k1}', 'k1', 'testing'), null)).toEqual(
      makeMap('k1', 'testing', 'k2', 'blah testing', 'k3', 'more blah testing'));
});

test('resolve_nested_keys_level3', () => {
  expect(resolveAllValues(
    makeMap('k1', 'x', 'k2', 'blah ${k1}', 'k3', 'more ${k2}', 'k4', 'yeah ${k3}'), null)).toEqual(
      makeMap('k1', 'x', 'k2', 'blah x', 'k3', 'more blah x', 'k4', 'yeah more blah x'));
});

test('resolve_returns_unresolved_keys', () => {
  {
    let unresolvedKeys = new Set();
    expect(resolveAllValues(makeMap('x', '${y}'), unresolvedKeys)).toEqual(makeMap('x', '${y}'));
    expect(unresolvedKeys).toEqual(new Set(['x']));
  }
  {
    let unresolvedKeys = new Set();
    expect(resolveAllValues(
      makeMap('x', '${y}', 'z', '9', 'c', 'm=${z}', 'd', '${abc}'), unresolvedKeys)).toEqual(
        makeMap('x', '${y}', 'z', '9', 'c', 'm=9', 'd', '${abc}'));
    expect(unresolvedKeys).toEqual(new Set(['x', 'd']));
  }
});

test('resolve_vareq', () => {
  expect(resolveAllValues(
    makeMap('x', 'blah', 'y', '$vareq ${x} == blah', 'z', '$vareq ${x} ==blah1'), null)).toEqual(
      makeMap('x', 'blah', 'y', 'true', 'z', 'false'));
});

test('resolve_varif', () => {
  expect(resolveAllValues(
    makeMap('x', 'blah', 'y', '$vareq ${x}== blah', 'z', '$vareq ${x} == blah1', 'w', '$varif ${y} ??yes:: no', 't', '$varif ${z} ?? yes ::no'), null)).toEqual(
      makeMap('x', 'blah', 'y', 'true', 'z', 'false', 'w', 'yes', 't', 'no'));
});

test('resolve_vareq bad syntax', () => {
  // Missing "=="
  expect(() => resolveAllValues(makeMap('x', '$vareq a'), null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$vareq a b'), null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$vareq a = b'), null)).toThrow(/incorrect syntax/);
});

test('resolve_varif bad syntax', () => {
  // Missing "??""
  expect(() => resolveAllValues(makeMap('x', '$varif a'), null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$varif a b'), null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$varif a b c'), null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$varif a ? b c'), null)).toThrow(/incorrect syntax/);
  // Missing "::"
  expect(() => resolveAllValues(makeMap('x', '$varif a ?? b c'), null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$varif a ?? b : c'), null)).toThrow(/incorrect syntax/);
});

test('finds unresolved keys', () => {
  let unresolvedKeys = new Set();
  let inputMap = makeMap('x', '${y}', 'name', 'Alicia', 'full_name', '${name} Keys', 'z', '${name} with ${x}');
  let outputMap = makeMap('x', '${y}', 'name', 'Alicia', 'full_name', 'Alicia Keys', 'z', 'Alicia with ${x}');
  expect(resolveAllValues(inputMap, unresolvedKeys)).toEqual(outputMap);
  expect(unresolvedKeys).toEqual(new Set(['x', 'z']));
});

test('circular reference', () => {
  let unresolvedKeys = new Set();
  let inputMap = makeMap('x', '${y}', 'y', '${x}');
  expect(resolveAllValues(inputMap, unresolvedKeys)).toEqual(inputMap);
  expect(unresolvedKeys).toEqual(new Set(['x', 'y']));
});
