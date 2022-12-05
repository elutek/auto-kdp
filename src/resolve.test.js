import { resolveAllValues } from './resolve';
import { makeMap } from './test-utils';

test('resolve_nochange', () => {
  expect(resolveAllValues(makeMap(), null, null)).toEqual(makeMap());
  expect(resolveAllValues(makeMap('a', 'b'), null, null)).toEqual(makeMap('a', 'b'));
  expect(resolveAllValues(makeMap('a', 'b${', 'c}', 'd'), null, null)).toEqual(makeMap('a', 'b${', 'c}', 'd'));
});

test('resolve_simple', () => {
  expect(resolveAllValues(
    makeMap('key1', 'xxx', 'key2', 'something ${key1}'), null, null)).toEqual(
      makeMap('key1', 'xxx', 'key2', 'something xxx'));
  expect(resolveAllValues(
    makeMap('key1', 'xxx', 'key2', '${key1} something'), null, null)).toEqual(
      makeMap('key1', 'xxx', 'key2', 'xxx something'));
  expect(resolveAllValues(
    makeMap('key1', 'xxx', 'key2', 'some${key1}thing'), null, null)).toEqual(
      makeMap('key1', 'xxx', 'key2', 'somexxxthing'));
});

test('resolve_nested_keys_level2', () => {
  expect(resolveAllValues(
    makeMap('k1', 'testing', 'k2', 'blah ${k1}', 'k3', 'more ${k2}'), null, null)).toEqual(
      makeMap('k1', 'testing', 'k2', 'blah testing', 'k3', 'more blah testing'));
  expect(resolveAllValues(
    makeMap('k3', 'more ${k2}', 'k2', 'blah ${k1}', 'k1', 'testing'), null, null)).toEqual(
      makeMap('k1', 'testing', 'k2', 'blah testing', 'k3', 'more blah testing'));
});

test('resolve_nested_keys_level3', () => {
  expect(resolveAllValues(
    makeMap('k1', 'x', 'k2', 'blah ${k1}', 'k3', 'more ${k2}', 'k4', 'yeah ${k3}'), null, null)).toEqual(
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
    makeMap('x', 'blah', 'y', '$vareq ${x} == blah', 'z', '$vareq ${x} ==blah1'), null, null)).toEqual(
      makeMap('x', 'blah', 'y', 'true', 'z', 'false'));

  expect(resolveAllValues(
    makeMap('x', 'X', 'y', 'Y', 'z', 'Z',
      'result1t', '$vareq ${x} == X',
      'result1f', '$vareq ${x} == bad',
      'result2t', '$vareq ${x} == X && ${y} == Y',
      'result2f', '$vareq ${x} == X && ${y} == a',
      'result3t', '$vareq ${y} == a || ${y} == b || ${y} == Y',
      'result3f', '$vareq ${y} == a || ${y} == b || ${y} == c',
      'result4t', '$vareq ${y} == a || ${y} == Y && ${x} == t || ${x} == X && ${y} == Y',
      'result4f', '$vareq ${y} != Y || ${y} == Y && ${x} == t || ${x} == X && ${y} == 2',
    ),
    null, null)).toEqual(
      makeMap('x', 'X', 'y', 'Y', 'z', 'Z',
        'result1t', 'true',
        'result1f', 'false',
        'result2t', 'true',
        'result2f', 'false',
        'result3t', 'true',
        'result3f', 'false',
        'result4t', 'true',
        'result4f', 'false',
      ),
    );
});

test('resolve_vareq bad syntax', () => {
  expect(() => resolveAllValues(makeMap('x', '$vareq a'), null, null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$vareq a b'), null, null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$vareq a = b'), null, null)).toThrow(/incorrect syntax/);
});

test('resolve_varif', () => {
  expect(resolveAllValues(
    makeMap(
      'x', 'blah',
      'y', '$vareq ${x}== blah',
      'z', '$vareq ${x} == blah1',
      'w', '$varif ${y} ??yes:: no',
      't', '$varif ${z} ?? yes ::no',
      'a', 'A',
      'b', 'B',
      'v_true', '$varif ${a} == B || ${a} == A && ${b} == B ?? yes :: no',
      'v_false', '$varif ${a} == C || ${a} == A && ${b} == blah ?? yes :: no',
    ), null, null)).toEqual(
      makeMap(
        'x', 'blah',
        'y', 'true',
        'z', 'false',
        'w', 'yes',
        't', 'no',
        'a', 'A',
        'b', 'B',
        'v_true', 'yes',
        'v_false', 'no'
      ));
});

test('resolve_varif bad syntax', () => {
  // Missing "??""
  expect(() => resolveAllValues(makeMap('x', '$varif a'), null, null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$varif a b'), null, null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$varif a b c'), null, null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$varif a ? b c'), null, null)).toThrow(/incorrect syntax/);
  // Missing "::"
  expect(() => resolveAllValues(makeMap('x', '$varif a ?? b c'), null, null)).toThrow(/incorrect syntax/);
  expect(() => resolveAllValues(makeMap('x', '$varif a ?? b : c'), null, null)).toThrow(/incorrect syntax/);
});

test('resolve_varbookref', () => {
  let data1 = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', '$varbookref name == Bob !! secret');
  let data2 = makeMap('name', 'Bob', 'secret', 'blah');
  let allData = [data1, data2];
  let expct = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', 'blah');
  expect(resolveAllValues(data1, null, allData)).toEqual(expct);
});

test('resolve_varbookref2', () => {
  let data1 = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', '$varbookref name == Bob && lastname == Y !! secret');
  let data2 = makeMap('name', 'Bob', 'lastname', 'X', 'secret', 'blahX');
  let data3 = makeMap('name', 'Bob', 'lastname', 'Y', 'secret', 'blahY');
  let allData = [data1, data2, data3];
  let expct = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', 'blahY');
  expect(resolveAllValues(data1, null, allData)).toEqual(expct);
});

test('resolve_varbookref_circular', () => {
  let data1 = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', '$varbookref name == Bob !! secret');
  let data2 = makeMap('name', 'Bob', 'secret', 'bob_secret', 'otherSecret', '$varbookref name == Alice !! secret');
  let allData = [data1, data2];
  let expc1 = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', 'bob_secret');
  let expc2 = makeMap('name', 'Bob', 'secret', 'bob_secret', 'otherSecret', 'alice_secret');
  expect(resolveAllValues(data1, null, allData)).toEqual(expc1);
  expect(resolveAllValues(data2, null, allData)).toEqual(expc2);
});

test('resolve_no_such_book', () => {
  let data1 = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', '$varbookref name == NONEXISTENT !! secret');
  let data2 = makeMap('name', 'Bob', 'secret', 'blah');
  let allData = [data1, data2];
  let expct = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', '');
  expect(resolveAllValues(data1, null, allData)).toEqual(expct);
});

test('resolve_varbookref_two_matches', () => {
  let data1 = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', '$varbookref name == Bob !! secret');
  let data2 = makeMap('name', 'Bob', 'lastname', 'X', 'secret', 'blahX');
  let data3 = makeMap('name', 'Bob', 'lastname', 'Y', 'secret', 'blahY');
  let allData = [data1, data2, data3];
  expect(() => resolveAllValues(data1, null, allData)).toThrow(/Matched more than one record/);
});

test('resolve_varbookref_no_such_field_in_search_key', () => {
  let data1 = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', '$varbookref NONEXISTENT_KEY == Bob !! secret');
  let data2 = makeMap('name', 'Bob', 'secret', 'blah');
  let allData = [data1, data2];
  let expct = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', 'blah');
  expect(() => resolveAllValues(data1, null, allData)).toThrow(/No such key.*NONEXISTENT/);
});

test('resolve_varbookref_no_such_field_in_return_object', () => {
  let data1 = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', '$varbookref name == Bob !! NONEXISTENT');
  let data2 = makeMap('name', 'Bob', 'secret', 'blah');
  let allData = [data1, data2];
  let expct = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', 'blah');
  expect(() => resolveAllValues(data1, null, allData)).toThrow(/No such key.*NONEXISTENT/);
});

test('resolve_varbookref_bad_key_syntax', () => {
  let data1 = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', '$varbookref xyz !! secret');
  let data2 = makeMap('name', 'Bob', 'secret', 'blah');
  let allData = [data1, data2];
  let expct = makeMap('name', 'Alice', 'secret', 'alice_secret', 'otherSecret', 'blah');
  expect(() => resolveAllValues(data1, null, allData)).toThrow(/Incorrect syntax of search key.*xyz/);
});

test('resolve_varbookref bad syntax', () => {
  // Missing "!!"
  expect(() => resolveAllValues(makeMap('x', '$varbookref a b c'), null, null)).toThrow(/incorrect syntax/);
});

test('unknown_var_syntax', () => {
  expect(() => resolveAllValues(makeMap('x', '$varnonexistent a'), null, null)).toThrow(/key starting with a special prefix/);
});

test('finds unresolved keys', () => {
  let unresolvedKeys = new Set();
  let inputMap = makeMap('x', '${y}', 'name', 'Alicia', 'full_name', '${name} Keys', 'z', '${name} with ${x}');
  let outputMap = makeMap('x', '${y}', 'name', 'Alicia', 'full_name', 'Alicia Keys', 'z', 'Alicia with ${x}');
  expect(resolveAllValues(inputMap, unresolvedKeys, null)).toEqual(outputMap);
  expect(unresolvedKeys).toEqual(new Set(['x', 'z']));
});

test('circular reference', () => {
  let unresolvedKeys = new Set();
  let inputMap = makeMap('x', '${y}', 'y', '${x}');
  expect(resolveAllValues(inputMap, unresolvedKeys, null)).toEqual(inputMap);
  expect(unresolvedKeys).toEqual(new Set(['x', 'y']));
});
