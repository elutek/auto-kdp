import ChildProcess from 'child_process';

import { ActionResult } from '../util/action-result.js';
import { debug, error } from '../util/utils.js';
import { fileExists } from './action-utils.js';
import { ActionParams } from '../util/action-params.js';
import { Book } from '../book/book.js';

export async function produceManuscript(book: Book, params: ActionParams): Promise<ActionResult> {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(book, verbose, 'Produce manuscript (dry run)');
    return new ActionResult(true);
  }
  const commandLine = book.manuscriptCreationCommand.replace("<ISBN>", book.isbn);
  debug(book, verbose, `Running command: ${commandLine}`);
  ChildProcess.execSync(commandLine, { stdio: 'inherit' });
  if (!fileExists(book.manuscriptLocalFile)) {
    error(book, `Manuscript file does note exist: ${book.manuscriptLocalFile}`);
    return new ActionResult(false).doNotRetry();
  }
  if (!fileExists(book.coverLocalFile)) {
    error(book, `Cover file does note exist: ${book.coverLocalFile}`);
    return new ActionResult(false).doNotRetry();
  }
  debug(book, verbose, `Found files: ${book.manuscriptLocalFile} and cover ${book.coverLocalFile}`);

  return new ActionResult(true);
}
