const {test} = require('node:test');
const assert = require('node:assert/strict');
const {computeHistoricalLow,parsePriceText} = require('../src/stats');
const fixture = require('./fixtures/4220665.json');
const point = (price,extra={}) => ({price,date:'2024-03-12T00:00:00Z',shopName:'Shop',active:true,...extra});
test('real ALL history excludes bogus 179 kr and retains actual qualifying low', () => {
 const items = fixture.priceHistory.historyItems;
 assert.ok(items.some(p => p.price === 17900));
 const result = computeHistoricalLow(items);
 assert.equal(result.lowestPrice,3848);
 assert.equal(result.shopName,'Christiania Glasmagasin');
 assert.equal(result.sampleCount,393);
});
test('membership, inactive, nonpositive, malformed and outlier points excluded',()=>{
 const result = computeHistoricalLow([point(10000),point(12000),point(11000),point(100),point(0),point(-1),point(200,{isMembershipPrice:true}),point(200,{isPaidMembership:true}),point(200,{active:false}),point(NaN),point('100'),null]);
 assert.equal(result.lowestPrice,100); assert.equal(result.sampleCount,3);
});
test('even median, exact boundary and currency conversion',()=>{
 assert.equal(computeHistoricalLow([point(3000),point(10000),point(10000)]).lowestPrice,30);
 assert.equal(computeHistoricalLow([point(100),point(1000)]).lowestPrice,10);
 assert.equal(computeHistoricalLow([point(12345)]).lowestPrice,123.45);
});
test('empty usable history',()=>{for(const items of [[],null,[point(0)],[point(100,{active:false})]]) assert.equal(computeHistoricalLow(items),null);});
test('Norwegian price formats and invalid text',()=>{
 for(const text of ['7 490 ,-','7\u00a0490 kr','7\u202f490 kr','fra 7 490 kr','7.490 NOK','7490']) assert.equal(parsePriceText(text),7490,text);
 assert.equal(parsePriceText('1 234,50 kr'),1234.5);
 for(const text of ['',null,'Gratis','0 kr','-100 kr','12 butikker','fra 10 kr til 20 kr']) assert.equal(parsePriceText(text),null,text);
});
