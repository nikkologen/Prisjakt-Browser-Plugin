(() => {
  const pj = globalThis.PJLow, enqueue = pj.createQueue(4), requests = new Map();
  let enabled = false, timer, generation = 0;
  function history(id) {
    if (!requests.has(id)) requests.set(id, enqueue(async () => {
      const cached = await pj.cache.get(id);
      if (cached.hit) return cached.value;
      let items;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {items = await pj.fetchPriceHistory(id); break;} catch(error) {if(attempt === 1) throw error;}
      }
      const low = pj.computeHistoricalLow(items);
      await pj.cache.set(id,low); return low;
    }));
    return requests.get(id);
  }
  function scan() {
    if (!enabled) return;
    const targets = pj.discover();
    for (const badge of document.querySelectorAll('.pj-low-badge')) {
      if (!targets.some(t => t.price.nextElementSibling === badge)) {
        const root = badge.closest('[data-pj-low-done]');
        if (root) root.removeAttribute('data-pj-low-done');
        badge.remove();
      }
    }
    for (const target of targets) {
      const key = target.id + ':' + target.current;
      if (target.root.dataset.pjLowDone === key && target.price.nextElementSibling?.classList.contains('pj-low-badge')) continue;
      const old = target.price.nextElementSibling;
      if (old?.classList.contains('pj-low-badge')) old.remove();
      target.root.dataset.pjLowDone = key;
      const badge = document.createElement('span'); badge.className = 'pj-low-badge'; badge.textContent = '…'; badge.title = 'Henter prishistorikk';
      target.price.after(badge);
      const version = generation;
      history(target.id).then(low => {if(enabled && version === generation && badge.isConnected) pj.renderBadge(badge,low,target.current);}, () => {if(enabled && version === generation && badge.isConnected) pj.renderBadge(badge,null,target.current,true);});
    }
  }
  function schedule() {clearTimeout(timer); timer = setTimeout(scan,150);}
  pj.ext.storage.onChanged.addListener((changes,area) => {
    if (area !== 'local') return;
    if (changes.enabled) {enabled = changes.enabled.newValue !== false; generation++; pj.removeBadges(); schedule();}
    if (changes.cacheRevision) {requests.clear(); generation++; pj.removeBadges(); schedule();}
  });
  new MutationObserver(records => {
    if(records.some(r => !r.target.closest?.('.pj-low-badge'))) schedule();
  }).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['href','class']});
  addEventListener('popstate',schedule);
  // Navigation may reuse existing DOM nodes without a mutation.
  let lastURL = location.href;
  setInterval(() => {if(lastURL !== location.href) {lastURL = location.href; generation++; pj.removeBadges(); schedule();}},1000);
  (async () => {await pj.cache.prune(); const settings = await pj.ext.storage.local.get('enabled'); enabled = settings.enabled !== false; scan();})().catch(console.error);
})();
