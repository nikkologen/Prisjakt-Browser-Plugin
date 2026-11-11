# Firefox reviewer instructions

This extension uses plain JavaScript and CSS. No build step, Node.js, dependencies, account, or API key is required. An internet connection is needed to fetch price history from Prisjakt.

## Install and run

1. Extract the submitted ZIP to a folder.
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on** and select `manifest.json` from the extracted folder.
4. Open or refresh a Prisjakt page. Price-comparison badges appear beside product prices after history loads.

## Verify

1. Check badges on these pages:
   - Front page: https://www.prisjakt.no/
   - Category: https://www.prisjakt.no/category.php?k=502
   - Search: https://www.prisjakt.no/search?query=kaffemaskin
   - Product: https://www.prisjakt.no/product.php?p=4220665
2. Hover over a badge to see the historical low, date, and shop. Live prices change, so percentages may vary.
3. Open the extension popup. Toggle **Vis prismerker på Prisjakt** off and on to hide and show badges.
4. Click **Tøm hurtiglager** to clear cached history and trigger fresh requests.

Settings and the 24-hour history cache are stored locally. Product IDs are sent to Prisjakt's price-history endpoint; there is no analytics or developer-operated backend.

The temporary installation is removed when Firefox restarts. After source changes, click **Reload** on the debugging page and refresh the Prisjakt tab.
