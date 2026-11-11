(() => {
  const pj = globalThis.PJLow;
  pj.ext = globalThis.browser ?? chrome;
  const prefix = 'pj-low-v1:';
  const ttl = 24 * 60 * 60 * 1000;
  const fresh = entry => entry && Number.isFinite(entry.expires) && entry.expires > Date.now();
  pj.cache = {
    prefix,
    async get(id) { const key = prefix + id; const data = await pj.ext.storage.local.get(key); return fresh(data[key]) ? {hit:true, value:data[key].value} : {hit:false}; },
    async set(id, value) { await pj.ext.storage.local.set({[prefix + id]:{expires:Date.now()+ttl, value}}); },
    async prune() { const data = await pj.ext.storage.local.get(null); const keys = Object.keys(data).filter(k => k.startsWith(prefix) && !fresh(data[k])); if(keys.length) await pj.ext.storage.local.remove(keys); }
  };
})();
