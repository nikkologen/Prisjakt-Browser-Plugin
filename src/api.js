(() => {
  const pj = globalThis.PJLow ??= {};
  pj.fetchPriceHistory = async productId => {
    if (!/^\d+$/.test(String(productId))) throw new Error('Invalid product id');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/price-history', {method:'POST', credentials:'omit', signal:controller.signal, headers:{'Content-Type':'application/json'}, body:JSON.stringify({productId:Number(productId), timeRange:'ALL', shopIds:[], variantIds:[]})});
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      if (!Array.isArray(data?.priceHistory?.historyItems)) throw new Error('Unexpected history response');
      return data.priceHistory.historyItems;
    } finally { clearTimeout(timeout); }
  };
})();
