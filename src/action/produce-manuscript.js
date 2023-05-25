import { ActionResult } from '../action-result.js';
import ChildProcess from 'child_process';
import { debug, error } from '../utils.js';
import { fileExists } from './action-utils.js';

export async function produceManuscript(book, params) {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(book, verbose, 'Produce manuscript (dry run)');
    return new ActionResult(true);
  }
  const commandLine = book.manuscriptCreationCommand.replace("<ISBN>", book.isbn);
  debug(book, verbose, `Running command: ${commandLine}`);
  ChildProcess.execSync(commandLine, (error, stdout, stderr) => {
    if (error) {
      throw Error(`error: ${error.message}`);
    }
    if (stderr) {
      debug(book, verbose, `stderr: ${stderr}`);
    }
    if (stdout) {
      debug(book, verbose, `stdout: ${stdout}`);
    }
  });
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
