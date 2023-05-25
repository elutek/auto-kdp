import { ActionCallback, ExecuteBookActions } from './book-action-executor.js';
import { makeOkTestBook } from './test-utils.js'
import { ActionResult } from './action-result.js';
import { ActionParams } from './action-params.js';

test('one action - succeeds', async () => {
    let book = makeOkTestBook();
    book.action = 'a';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(true);
    let result = await ExecuteBookActions(book, null, null, cb, new ActionParams());
    expect(result.numSuccesses).toEqual(1);
    expect(result.numFailures).toEqual(0);
});

test('one action - fails', async () => {
    let book = makeOkTestBook();
    book.action = 'a';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(false);
    let result = await ExecuteBookActions(book, null, null, cb, new ActionParams());
    expect(result.numSuccesses).toEqual(0);
    expect(result.numFailures).toEqual(1);
});

class CustomActionParams extends ActionParams {
    attempt: number = 1;
}

test('one action - succeeds on 2nd attempt', async () => {
    let book = makeOkTestBook();
    book.action = 'a';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(p.attempt++ > 1);
    let result = await ExecuteBookActions(book, null, null, cb, new CustomActionParams());
    expect(result.numSuccesses).toEqual(1);
    expect(result.numFailures).toEqual(0);
});

test('one action - succeeds on 3rd attempt', async () => {
    let book = makeOkTestBook();
    book.action = 'action1';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(p.attempt++ > 2);
    let result = await ExecuteBookActions(book, null, null, cb, new CustomActionParams());
    expect(result.numSuccesses).toEqual(1);
    expect(result.numFailures).toEqual(0);
});

test('one action - throws', async () => {
    let book = makeOkTestBook();
    book.action = 'a';
    const cb: ActionCallback = async (a, b, p) => { throw new Error('bad action'); }
    let result = await ExecuteBookActions(book, null, null, cb, new ActionParams());
    expect(result.numSuccesses).toEqual(0);
    expect(result.numFailures).toEqual(1);
});

test('two actions - both succeed', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(true);
    let result = await ExecuteBookActions(book, null, null, cb, new ActionParams());
    expect(result.numSuccesses).toEqual(2);
    expect(result.numFailures).toEqual(0);
});

test('two actions - 1 succeeds, 2 fails', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(a == 'a');
    let result = await ExecuteBookActions(book, null, null, cb, new ActionParams());
    expect(result.numSuccesses).toEqual(1);
    expect(result.numFailures).toEqual(1);
});

test('three actions - all succeed', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b:c';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(true);
    let result = await ExecuteBookActions(book, null, null, cb, new ActionParams());
    expect(result.numSuccesses).toEqual(3);
    expect(result.numFailures).toEqual(0);
});

test('three actions - 1-2 succeed, 3 fails', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b:c';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(a != 'c');
    let result = await ExecuteBookActions(book, null, null, cb, new ActionParams());
    expect(result.numSuccesses).toEqual(2);
    expect(result.numFailures).toEqual(1);
});

test('three actions - 1 succeed 2 fails 3 never runs', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b:c';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(a != 'b');
    let result = await ExecuteBookActions(book, null, null, cb, new ActionParams());
    expect(result.numSuccesses).toEqual(1);
    expect(result.numFailures).toEqual(1);
});

test('next actions - last', async () => {
    let book = makeOkTestBook();
    book.action = 'a';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(a == 'a').setNextActions('NEXT');
    let result = await ExecuteBookActions(book, null, null, cb, new ActionParams());
    expect(book.action).toEqual('NEXT');
});

test('next actions - not last', async () => {
    let book = makeOkTestBook();
    book.action = 'a:b';
    const cb: ActionCallback = async (a, b, p) => new ActionResult(a == 'a').setNextActions('NEXT');
    let result = await ExecuteBookActions(book, null, null, cb, new ActionParams());
    expect(book.action).toEqual('NEXT:b');
});
