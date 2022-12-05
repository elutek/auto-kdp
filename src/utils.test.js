import { arraysEqual, mergeActions, normalizeText, stripPrefix } from './utils';

test('mergeActions', () => {
  expect(mergeActions('a:b', 'c:d')).toEqual('a:b:c:d');
  expect(mergeActions('a', 'c')).toEqual('a:c');
  expect(mergeActions('a:b', '')).toEqual('a:b');
  expect(mergeActions('a', '')).toEqual('a');
  expect(mergeActions('', 'a:b')).toEqual('a:b');
  expect(mergeActions('', 'a')).toEqual('a');
  expect(mergeActions('', '')).toEqual('');
});

test('arraysEqual', () => {
  expect(arraysEqual(null, null)).toEqual(true);
  expect(arraysEqual([], [])).toEqual(true);
  expect(arraysEqual([], null)).toEqual(false);
  expect(arraysEqual(null, ['a'])).toEqual(false);
  expect(arraysEqual(['a'], ['a'])).toEqual(true);
  expect(arraysEqual(['a'], ['b'])).toEqual(false);
  expect(arraysEqual(['a'], ['b', 'c'])).toEqual(false);
  expect(arraysEqual(['a', 'c'], ['a', 'b'])).toEqual(false);
  expect(arraysEqual(['a', 'c'], ['a', 'c'])).toEqual(true);

  let arr = ['a', 'z'];
  expect(arraysEqual(arr, arr)).toEqual(true);
});

test('normalizeText', () => {
  expect(normalizeText('')).toEqual('');
  expect(normalizeText('blah')).toEqual('blah');
  expect(normalizeText('  \t\nblah\t      ')).toEqual('blah');
  expect(normalizeText('  blah \n \t blah \n\t \n\n')).toEqual('blah blah');
  expect(normalizeText('  <p>abc</p>   <p>def</p>')).toEqual('<p>abc</p><p>def</p>');
  expect(normalizeText('  <p>abc. </p>')).toEqual('<p>abc.</p>');
});

test('stripPrefix', () => {
  expect(stripPrefix('', 'blah')).toEqual('');
  expect(stripPrefix('test', 'blah')).toEqual('test');
  expect(stripPrefix('test', '')).toEqual('test');
  expect(stripPrefix('test', 't')).toEqual('est');
  expect(stripPrefix('test', 'test')).toEqual('');
});
