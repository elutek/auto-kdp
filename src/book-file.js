import * as fs from 'fs';
import _ from 'lodash';

import * as lockfile from 'proper-lockfile';
import CsvParser from 'csv-parser';
import CsvWriter from 'csv-writer';
import PropertiesReader from 'properties-reader';

import { Book } from './book.js';
import { BookList } from './book-list.js';

// We protect  file with a lock, because it will be updated in-place.
export class BookFile {

  constructor(bookFilePath, bookConfigFilePath, contentDir) {
    this.contentDir = contentDir;
    this.bookFilePath = bookFilePath;
    this.lockFilePath = bookFilePath + '.lock';
    this.outputFilePath = bookFilePath + '.new';
    this.bookConfig = new Map();
    this.headers = [];
    this.isbns = {};
    this.ids = {};
    this.signatures = {};
    PropertiesReader(bookConfigFilePath).each((k, v) => this.bookConfig.set(k, v));
  }

  async readBooksAsync() {
    return new Promise((resolve, reject) => {
      lockfile.lock(this.lockFilePath)
        .then((release) => {
          let dataMaps = [];
          fs.createReadStream(this.bookFilePath)
            .pipe(CsvParser({
              mapHeaders: ({ header, index }) => {
                let h = header.trim();
                this.headers[index] = h;
                return h;
              },
              mapValues: ({ header, index, value }) => {
                let newValue = value.trim().replace('^"', '').replace('"$', '');
                if (newValue.startsWith("file:")) {
                  // Special value like "file:blah.txt" means: "read me from a file blah.txt"
                  let fileName = newValue.substring("file:".length);
                  try {
                    newValue = fs.readFileSync(fileName, { encoding: 'utf-8' });
                  } catch (e) {
                    throw new Exception("Could not read file: " + fileName, e);
                  }
                }
                return newValue;
              },
              strict: true,
              skipComments: true
            }))
            .on('data', (data) => {
              dataMaps.push(new Map(Object.entries(data)));
            })
            .on('end', () => {
              console.log('Read ' + dataMaps.length + ' rows');
              let bookList = new BookList();
              let rowNumber = 1;
              for (const dataMap of dataMaps) {
                try {
                  let book = new Book(dataMap, this.bookConfig, this.contentDir, dataMaps);
                  this.addBook(book, bookList);
                  rowNumber++;
                } catch (e) {
                  console.error('Problem processing row', rowNumber, 'with data:', dataMap, ': ', e);
                  reject(e);
                  return release();
                }
              }
              resolve(bookList);
              return release();
            })
        })
    });
  }

  async writeBooksAsync(bookList) {
    return new Promise((resolve, reject) =>
      lockfile.lock(this.lockFilePath)
        .then((release) => {
          try {
            const headers = _.map(this.headers, x => ({ id: x, title: x }));
            const writer = CsvWriter.createObjectCsvWriter({ path: this.outputFilePath, header: headers });
            const records = bookList.books.map(x => x.getDataToWrite());
            console.log("Wriring " + records.length + " records");
            writer.writeRecords(records)
              .then(() => resolve())
              .catch(/* istanbul ignore next */
                (e) => reject(e));
          } catch (e) {
            /* istanbul ignore next */
            reject(e);
          } finally {
            return release();
          }
        })
    );
  }

  addBook(book, bookList) {
    // Check id uniqueness.
    if (book.id != '') {
      if (book.id in this.ids) {
        throw new Error('Id not unique: ' + book.id);
      }
      this.ids[book.id] = book;
    }

    // Check isbn uniqueness.
    if (book.isbn != "") {
      if (book.isbn in this.isbns) {
        throw new Error('ISBN not unique: ' + book.isbn);
      }
      this.isbns[book.isbn] = book;
    }

    // Check signature (name, gender, image id) uniqness.
    let sig = book.signature;
    if (sig in this.signatures) {
      throw new Error('Signature not unique: ' + sig);
    }
    this.signatures[sig] = book;

    bookList.addBook(book);
  }
}
