import { doScrapeAmazonCoverImageUrl } from "./scrape-amazon-cover-image-url";


test('can parse amazon cover image url', () => {
    expect(doScrapeAmazonCoverImageUrl(null)).toEqual(null);
    expect(doScrapeAmazonCoverImageUrl('')).toEqual(null);
    expect(doScrapeAmazonCoverImageUrl('blah blah test')).toEqual(null);
    expect(doScrapeAmazonCoverImageUrl('blah blah "mainUrl":"https://m.media-amazon.com/images/I/618Xq0DFecL.jpg" blah blah')).toEqual("618Xq0DFecL.jpg");
});