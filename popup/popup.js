const ext = globalThis.browser ?? chrome;
const toggle = document.getElementById('enabled'), clear = document.getElementById('clear'), status = document.getElementById('status');
async function refresh() {const data = await ext.storage.local.get(null); toggle.checked = data.enabled !== false; document.getElementById('count').textContent = Object.keys(data).filter(k => k.startsWith('pj-low-v1:') && data[k]?.expires > Date.now()).length + ' produkter i hurtiglager';}
toggle.addEventListener('change',async () => {try {await ext.storage.local.set({enabled:toggle.checked});} catch(e) {status.textContent = 'Kunne ikke lagre innstillingen.';}});
clear.addEventListener('click',async () => {clear.disabled = true; try {const data = await ext.storage.local.get(null); await ext.storage.local.remove(Object.keys(data).filter(k => k.startsWith('pj-low-v1:'))); await ext.storage.local.set({cacheRevision:Date.now()}); await refresh(); status.textContent = 'Hurtiglager tømt.';} catch(e) {status.textContent = 'Kunne ikke tømme hurtiglager.';} finally {clear.disabled = false;}});
refresh().catch(() => {status.textContent = 'Kunne ikke lese innstillinger.';});
