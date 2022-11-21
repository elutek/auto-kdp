import { ExecuteBookActions } from './book-action-executor.js';
import { ActionsResult } from './actions-result.js';
import { makeOkTestBook } from './test-utils'
import { ActionResult } from './action-result.js';

test('one action - succeeds', async () => {
    let book = makeOkTestBook();
    book.action = 'a';
    let cb = async (a, b, p) => new ActionResult(true);
    let result = await ExecuteBookActions(book, cb, {});
    expect(result.numSuccesses).toEqual(1);
    expect(result.numFailures).toEqual(0);
});

test('one action - fails', async () => {
    let book = makeOkTestBook();
    book.action = 'a';
    let cb = async (a, b, p) => new ActionResult(false);
    let result = await ExecuteBookActions(book, cb, {});
    expect(result.numSuccesses).toEqual(0);
    expect(result.numFailures).toEqual(1);
});

test('one action - succeeds on 2nd attempt', async () => {
    let book = makeOkTestBook();
    book.action = 'a';
    let cb = async (a, b, p) => new ActionResult(p.attempt++ > 1);
    let result = await ExecuteBookActions(book, cb, { attempt: 1 });
    expect(result.numSuccesses).toEqual(1);
    expect(result.numFailures).toEqual(0);
});

test('one action - succeeds on 3rd attempt', async () => {
    let book = makeOkTestBook();
    book.action = 'action1';
    let cb = async (a, b, p) => new ActionResult(p.attempt++ > 2);
    let result = await ExecuteBookActions(book, cb, { attempt: 1 });
    expect(result.numSuccesses).toEqual(1);
    expect(result.numFailures).toEqual(0);
});

test('one action - throws', async () => {
    let book = makeOkTestBook();
    book.action = 'a';
    let cb = async (a, b, p) => { throw new Error('bad action'); }
    let result = await ExecuteBookActions(book, cb, {});
    expect(result.numSuccesses).toEqual(0);
    expect(result.numFailures).toEqual(1);
});

test('two actions - both succeed', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b';
    let cb = async (a, b, p) => new ActionResult(true);
    let result = await ExecuteBookActions(book, cb, {});
    expect(result.numSuccesses).toEqual(2);
    expect(result.numFailures).toEqual(0);
});

test('two actions - 1 succeeds, 2 fails', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b';
    let cb = async (a, b, p) => new ActionResult(a == 'a');
    let result = await ExecuteBookActions(book, cb, {});
    expect(result.numSuccesses).toEqual(1);
    expect(result.numFailures).toEqual(1);
});

test('three actions - all succeed', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b:c';
    let cb = async (a, b, p) => new ActionResult(true);
    let result = await ExecuteBookActions(book, cb, {});
    expect(result.numSuccesses).toEqual(3);
    expect(result.numFailures).toEqual(0);
});

test('three actions - 1-2 succeed, 3 fails', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b:c';
    let cb = async (a, b, p) => new ActionResult(a != 'c');
    let result = await ExecuteBookActions(book, cb, {});
    expect(result.numSuccesses).toEqual(2);
    expect(result.numFailures).toEqual(1);
});

test('three actions - 1 succeed 2 fails 3 never runs', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b:c';
    let cb = async (a, b, p) => new ActionResult(a != 'b');
    let result = await ExecuteBookActions(book, cb, {});
    expect(result.numSuccesses).toEqual(1);
    expect(result.numFailures).toEqual(1);
});

test('next actions - last', async () => {
    let book = makeOkTestBook();
    book.action = 'a';
    let cb = async (a, b, p) => new ActionResult(a == 'a').setNextActions('NEXT');
    let result = await ExecuteBookActions(book, cb, {});
    expect(book.action).toEqual('NEXT');
});

test('next actions - not last', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b';
    let cb = async (a, b, p) => new ActionResult(a == 'a').setNextActions('NEXT');
    let result = await ExecuteBookActions(book, cb, {});
    expect(book.action).toEqual('NEXT:b');
});
