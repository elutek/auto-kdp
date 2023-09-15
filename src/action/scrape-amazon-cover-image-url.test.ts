import { doScrapeAmazonCoverImageUrl } from "./scrape-amazon-cover-image-url.js";


test('simple examples', () => {
  expect(doScrapeAmazonCoverImageUrl(null, null, false)).toEqual(null);
  expect(doScrapeAmazonCoverImageUrl('', null, false)).toEqual(null);
  expect(doScrapeAmazonCoverImageUrl('blah blah test', null, false)).toEqual(null);
  expect(doScrapeAmazonCoverImageUrl('blah blah <img src="https://m.media-amazon.com/images/I/xyz.jpg" />', null, false)).toEqual("xyz.jpg");
});


const REAL_EXAMPLE = `
    <li data-csa-c-action="image-block-main-image-hover" data-csa-c-element-type="navigational" data-csa-c-posy="1" data-csa-c-type="uxElement" class="image item itemNo0 maintain-height selected" style="cursor: pointer;" data-csa-c-id="ih7lyt-h4scg6-xsre21-hh29hg"><span class="a-list-item"> <span class="a-declarative" data-action="main-image-click" data-csa-c-type="widget" data-csa-c-func-deps="aui-da-main-image-click" data-main-image-click="{}" data-ux-click="" data-csa-c-id="exnr9q-lfyqvt-beabn1-31aq8a"> <div id="imgTagWrapperId" class="imgTagWrapper" style="height: 450.769px;">
	  <img alt="Ek praat Italiaans, Parlo italiano: Afrikaans-Italiaans prentewoordeboek vir kinders, Dizionario illustrato per bambini in afrikaans-italiano (Visuele taalleer vir kinders (AF)) (Afrikaans Edition)" src="https://m.media-amazon.com/images/I/616xGtOSgTL._SY466_.jpg" data-old-hires="https://m.media-amazon.com/images/I/616xGtOSgTL._SL1000_.jpg" onload="markFeatureRenderForImageBlock(); this.onload='';setCSMReq('af');if(typeof addlongPoleTag === 'function'){ addlongPoleTag('af','desktop-image-atf-marker');};setCSMReq('cf')" data-a-image-name="landingImage" class="a-dynamic-image a-stretch-horizontal" id="landingImage" data-a-dynamic-image="{&quot;https://m.media-amazon.com/images/I/616xGtOSgTL._SY342_.jpg&quot;:[342,342],&quot;https://m.media-amazon.com/images/I/616xGtOSgTL._SY466_.jpg&quot;:[466,466],&quot;https://m.media-amazon.com/images/I/616xGtOSgTL._SY522_.jpg&quot;:[522,522],&quot;https://m.media-amazon.com/images/I/616xGtOSgTL._SY425_.jpg&quot;:[425,425],&quot;https://m.media-amazon.com/images/I/616xGtOSgTL._SY385_.jpg&quot;:[385,385]}" style="max-width: 293px; max-height: 293px;"> </div>
	    </span> </span></li> src="https://m.media-amazon.com/images/I/BAD.NOT.ME.jpg"
`;

test('real example', () => {
  expect(doScrapeAmazonCoverImageUrl(REAL_EXAMPLE, null, false)).toEqual("616xGtOSgTL._SY466_.jpg");
});

const NEG_REAL_EXAMPLE = `
	  <img alt="blah blah" src="https://m.media-amazon.com/images/I/51QwyKcBHsL._SX38_SY50_CR,0,0,38,50_.jpg">
`

test('neg real example', () => {
  expect(doScrapeAmazonCoverImageUrl(NEG_REAL_EXAMPLE, null, false)).toEqual(null);
});