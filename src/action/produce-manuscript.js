import ChildProcess from 'child_process';
import { fileExists, debug } from './utils.js';

export async function produceManuscript(book, params) {
  const verbose = params.verbose;

  if (params.dryRun) {
    debug(verbose, 'Produce manuscript (dry run)');
    return true;
  }
  const commandLine = book.manuscriptCreationCommand;
  debug(verbose, `Running command: ${commandLine}`);
  ChildProcess.execSync(commandLine, (error, stdout, stderr) => {
    if (error) throw Error(`error: ${error.message}`);
    if (stderr) console.log(`stderr: ${stderr}`);
    if (stdout) console.log(`stdout: ${stdout}`);
  });
  if (!fileExists(book.manuscriptLocalFile)) {
    console.error(`Manuscript file does note exist: ${book.manuscriptLocalFile}`);
    return false;
  }
  if (!fileExists(book.coverLocalFile)) {
    console.error(`Cover file does note exist: ${book.coverLocalFile}`);
    return false;
  }
  debug(verbose, `Found files: ${book.manuscriptLocalFile} and cover ${book.coverLocalFile}`);

  return true;
}
