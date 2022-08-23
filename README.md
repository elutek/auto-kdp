# Troubleshooting

Common issues
- if Kdp determines a book has errors during content upload, content upload will continueously fail
- content upload does not work with headless borwser for unknown reason
- cotent upload does not work with browser window that is too small - make it big
- trim sizing is non-trivial: read https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6 to figure out. Or upload whatever, and the error displayed on the review page will tell you the expected trim.

# Development

## To add a new key

1. First add to keys.js
2. Then add to book.js in the constructor
3. Make all tests pass, which typically update book.js, test-utils.js and some random locations
4. Use the new fields in some actions update desired src/action/...