# Objective

Command-line tool to create or update books on Amazon KDP. Auto-kdp uses puppeteer under the hood to click thorugh the KDP pages like a human wood.

This software does NOT bypass any checks in KDP, nor try do do anything "shady" with it, does not create any randomness to pretend we are not a robot.
Updates are done sequentially, so there is no change of getting rate-limited.
All we do is automate the "clicking" on the website when you have many books to update, for example changing pricing on 100 books. 

# Usage

1. Read the keys.js file - these are the minimal set of keys that need to be provided for each book. See 'testdata' for an example config. The key 'action' is special and tells what to do.
2. Put your books in ```books.csv```. One row per book. Put defaults in ```books.conf``` (value=key format).  Start with setting action=all for simplicitly.
 - For example, imagine you are creating a long series of books, where each book talks about a different animal. 
| animal | title | ... |
| ------ | ----- | ---------- |
|sheep       | About sheep       |...|
|chicken     | About chicken     |...|
|caterpillar | About caterpillar |...|
   and in the config file
   ```author = 'John Smith'```
 - The title follows a scheme and can be removed from the CSV file into the default 
 ```title = About ${animal}```
3. Run in a non-headless mode first (you may want to try --dry-run first)
```bash
./auto-kdp/index.js --books books.csv --config books.conf --content-dir content --verbose --headless=no
```
4.  Auto-kdp processes colon-separated actions from the 'action' keys, consumes the actions that are executed, and leaves the actions that haven't been (e.g. block on something). After every successful action, books.csv.new is written out to know exactly what is done and what isn't.
5. Review the difference between books.csv and books.csv.new and 'mv books.csv.new books.csv' to use the new file from now on.

# Troubleshooting

Common issues
- if Kdp determines a book has errors during content upload, content upload will continueously fail
- content upload does not work with headless borwser for unknown reason
- cotent upload does not work with browser window that is too small - make it big
- trim sizing is non-trivial: read https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6 to figure out. Or upload whatever, and the error displayed on the review page will tell you the expected trim.

# Development

## To add a new custom key

1. First add to keys.js
2. Then add to book.js in the constructor
3. Make all tests pass, which typically update book.js, test-utils.js and some random locations
4. Use the new fields in some actions update desired src/action/...
