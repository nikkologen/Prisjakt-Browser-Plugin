const {test} = require('node:test');
const assert = require('node:assert/strict');
const {parseHTML} = require('linkedom');
const fs = require('node:fs');
const vm = require('node:vm');
function discover(html, url='https://www.prisjakt.no/search?query=kaffemaskin') {
 const {document} = parseHTML(html);
 const context = vm.createContext({document,location:new URL(url),URL,Intl,Date});
 for(const file of ['stats','dom']) vm.runInContext(fs.readFileSync(require.resolve('../src/'+file+'.js'),'utf8'),context);
 return {document,pj:context.PJLow,targets:context.PJLow.discover()};
}
// Reduced public markup observed in the live search page on 11 November 2026.
const searchCard = (id='4815333') => `<div data-test="ProductGridCard"><div data-sentry-component="ContentWrapper">
 <a data-test="ProductCardProductName" href="/product.php?p=${id}"><p>Siemens EQ.6 Plus S100</p></a>
 <div data-sentry-component="Rating"><p>(13)</p></div>
 <div data-sentry-component="Price"><p>fra</p><p class="text-body-medium font-heaviest">5&nbsp;972&nbsp;kr</p></div>
 <div data-sentry-component="StoreInfo"><p>hos Multicom</p><p>+5 butikker</p></div>
 <div data-test="UsedBadge"><p>fra 3&nbsp;597&nbsp;kr</p></div>
 </div></div>`;
test('search div card selects the new price, excluding cheaper used offers',()=>{
 const {targets}=discover(searchCard());
 assert.equal(targets.length,1);assert.equal(targets[0].id,'4815333');assert.equal(targets[0].current,5972);
 assert.equal(targets[0].price.parentElement.getAttribute('data-sentry-component'),'Price');
});
test('nested legacy category cards are discovered once',()=>{
 const {targets}=discover('<li data-test="ProductGridCard"><article data-test="ProductGridCard"><a href="/product.php?p=4220665">Product</a><span class="StyledPrice-x">7 490 ,-</span></article></li>','https://www.prisjakt.no/category.php?k=502');
 assert.equal(targets.length,1);assert.equal(targets[0].root.tagName,'ARTICLE');assert.equal(targets[0].current,7490);
});
test('mixed search content and dynamic insertions preserve card boundaries',()=>{
 const {document,pj}=discover('<ul><li><a href="/artikler/coffee">Article</a><p>100 kr</p></li><li>'+searchCard()+'</li></ul>');
 document.querySelector('ul').insertAdjacentHTML('beforeend','<li>'+searchCard('1641609')+'</li>');
 const targets=pj.discover();assert.equal(targets.length,2);assert.equal(new Set(targets.map(t=>t.root)).size,2);
});
test('product offer discovery remains supported',()=>{
 const {targets}=discover('<div data-test="OfferListItem"><h4>8 690 kr</h4></div><div data-test="OfferListItem"><h4>5 990 kr</h4></div>','https://www.prisjakt.no/product.php?p=4220665');
 assert.equal(targets.length,1);assert.equal(targets[0].current,5990);
});
