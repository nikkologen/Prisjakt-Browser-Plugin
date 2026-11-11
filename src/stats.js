(() => {
  function computeHistoricalLow(items) {
    const valid = (Array.isArray(items) ? items : []).filter(p => p && typeof p.price === 'number' && Number.isFinite(p.price) && p.price > 0 && p.active !== false && !p.isMembershipPrice && !p.isPaidMembership);
    if (!valid.length) return null;
    const sorted = valid.map(p => p.price).sort((a,b) => a-b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[middle] : (sorted[middle-1] + sorted[middle]) / 2;
    const kept = valid.filter(p => p.price >= median * .3);
    const low = kept.reduce((a,b) => b.price < a.price ? b : a);
    return {lowestPrice: low.price / 100, date: low.date, shopName: low.shopName || 'Ukjent butikk', sampleCount: kept.length};
  }
  function parsePriceText(text) {
    if (typeof text !== 'string') return null;
    const clean = text.replace(/\u00a0|\u202f/g, ' ').trim();
    const match = clean.match(/^(?:fra\s+)?(\d+(?:[ .]\d{3})*(?:,\d{1,2})?)\s*(?:,?[-–]|kr\.?|NOK)?$/i);
    if (!match) return null;
    const price = Number(match[1].replace(/[ .]/g,'').replace(',','.'));
    return Number.isFinite(price) && price > 0 ? price : null;
  }
  const exports = {computeHistoricalLow, parsePriceText};
  Object.assign(globalThis.PJLow ??= {}, exports);
  if (typeof module !== 'undefined') module.exports = exports;
})();
