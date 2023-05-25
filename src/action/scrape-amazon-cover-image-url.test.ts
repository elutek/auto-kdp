import { doScrapeAmazonCoverImageUrl } from "./scrape-amazon-cover-image-url.js";


test('can parse amazon cover image url', () => {
    expect(doScrapeAmazonCoverImageUrl(null, null, false)).toEqual(null);
    expect(doScrapeAmazonCoverImageUrl('', null, false)).toEqual(null);
    expect(doScrapeAmazonCoverImageUrl('blah blah test', null, false)).toEqual(null);
    expect(doScrapeAmazonCoverImageUrl('blah blah "mainUrl":"https://m.media-amazon.com/images/I/618Xq0DFecL.jpg" blah blah', null, false)).toEqual("618Xq0DFecL.jpg");
});
