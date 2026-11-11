(() => {
  const pj = globalThis.PJLow;
  pj.pageType = () => {
    const url = new URL(location.href);
    if (url.pathname === '/product.php' && /^\d+$/.test(url.searchParams.get('p'))) return 'product';
    if (url.pathname === '/category.php' || url.pathname.startsWith('/c/') || url.pathname === '/search') return 'listing';
    return null;
  };
  pj.discover = () => {
    const targets = [];
    if (!pj.pageType()) return targets;
    for (const card of document.querySelectorAll('[data-test="ProductGridCard"]')) {
      // Legacy listings also label the enclosing li; process only the inner card.
      if (card.querySelector('[data-test="ProductGridCard"]')) continue;
      const link = card.querySelector('a[href*="product.php?p="]');
      const id = link && new URL(link.getAttribute('href'), location.href).searchParams.get('p');
      // Search uses the new Price component. Keep discovery inside that component
      // so a cheaper UsedBadge or a shop count cannot become the current price.
      const price = [...card.querySelectorAll('[data-test="ProductPrice"], [class*="StyledPrice"], [data-sentry-component="Price"] p')].find(el => pj.parsePriceText(el.textContent) !== null);
      if (id && /^\d+$/.test(id) && price) targets.push({root:card, price, id, current:pj.parsePriceText(price.textContent)});
    }
    if (pj.pageType() === 'product') {
      const offers = [...document.querySelectorAll('[data-test="OfferListItem"] h4')].map(price => ({price,current:pj.parsePriceText(price.textContent)})).filter(t => t.current !== null);
      offers.sort((a,b) => a.current-b.current);
      if (offers.length) targets.push({...offers[0],root:offers[0].price,id:new URL(location.href).searchParams.get('p')});
    }
    return targets;
  };
  const money = value => new Intl.NumberFormat('nb-NO',{maximumFractionDigits:2}).format(value) + ' kr';
  pj.renderBadge = (badge, low, current, error = false) => {
    badge.className = 'pj-low-badge';
    if (error) { badge.textContent = 'Kunne ikke hente'; badge.title = 'Prishistorikken kunne ikke hentes. Prøv å laste siden på nytt.'; return; }
    if (!low) {badge.textContent = 'Ingen prishistorikk'; badge.title = 'Ingen gyldige historiske priser.'; return;}
    const percentage = Math.round((current-low.lowestPrice)/low.lowestPrice*100);
    const ratio = current/low.lowestPrice;
    badge.classList.add(ratio <= 1.01 ? 'pj-low-green' : ratio <= 1.15 ? 'pj-low-yellow' : 'pj-low-red');
    badge.textContent = ratio <= 1.01 ? 'Laveste pris!' : '+' + percentage + ' % over laveste';
    const date = new Date(low.date);
    badge.title = 'Laveste: ' + money(low.lowestPrice) + ' (' + (Number.isNaN(date.getTime()) ? 'ukjent dato' : date.toLocaleDateString('nb-NO',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'})) + ', ' + low.shopName + ')';
  };
  pj.removeBadges = () => {document.querySelectorAll('.pj-low-badge').forEach(el => el.remove()); document.querySelectorAll('[data-pj-low-done]').forEach(el => el.removeAttribute('data-pj-low-done'));};
})();
