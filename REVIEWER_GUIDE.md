# Reviewer guide: Prisjakt historisk lavpris

## 1. Prepare the source

Extract the submitted archive to a local directory. Open the directory containing
`manifest.json`; this is the extension root.

The extension uses plain JavaScript and CSS. There is no compilation,
transpilation, bundling, minification, environment configuration, or server to
start. The files in `src/` and `popup/` are the source files loaded by the browser
directly. No Node.js installation or dependency installation is required to run
the extension. PNG icons are included and do not need to be regenerated.

Use a current desktop Firefox or Chrome browser. An internet connection to
`https://www.prisjakt.no/` is required for live testing. No Prisjakt account,
credentials, API key, subscription, or payment is required.

## 2. Load the extension in Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on**.
3. Select `manifest.json` in the extracted extension root.
4. Confirm that **Prisjakt historisk lavpris** appears in the extensions list.
5. Open a new Prisjakt tab, or reload an existing Prisjakt tab.

This temporary installation is removed when Firefox restarts. After editing
source files, select **Reload** for the extension on the debugging page and
refresh the Prisjakt tab.

## 3. Alternatively, load the extension in Chrome

1. Navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Select the extracted extension root directory, containing `manifest.json`.
5. Open a new Prisjakt tab, or reload an existing Prisjakt tab.

After editing source files, reload the extension from `chrome://extensions` and
refresh the Prisjakt tab.

## 4. Verify the main functionality

1. Open `https://www.prisjakt.no/category.php?k=502`.
2. Wait for badges next to product prices. The initial loading state is `…`.
   Requests run four at a time, so later cards may take longer to finish.
3. Hover over a completed badge. Its tooltip shows the historical low in NOK,
   its date, and the shop name.
4. Open `https://www.prisjakt.no/search?query=kaffemaskin` and verify badges on
   product results. Articles and other non-product results are not annotated.
5. Open `https://www.prisjakt.no/` and verify badges in product carousels.
   Cards without a current price are skipped. The same product can receive a
   badge in multiple carousels.
6. Open `https://www.prisjakt.no/product.php?p=4220665` and verify a badge next
   to the lowest currently rendered offer price.
7. Follow pagination or navigate between supported pages. Newly inserted cards
   should be annotated without duplicate badges beside the same price.

Prices and historical data change; the reviewer should not expect a fixed badge
percentage on live pages. Green means the current price is at or within 1% of
the calculated historical low (`Laveste pris!`); yellow is above 1% and up to 15%;
red is above 15%. Other completed badges display `+N % over laveste`.

## 5. Verify the popup controls

1. Open the extension from the browser toolbar/extensions menu.
2. Uncheck **Vis prismerker på Prisjakt**. Existing badges should disappear.
3. Check it again. Badges should reappear.
4. Check the cached-product count shown in the popup.
5. Select **Tøm hurtiglager**. The popup should confirm the cache was cleared;
   open Prisjakt tabs rescan and fetch data again. Consequently the count can
   increase again shortly after clearing.

The extension is enabled by default. Historical results, including empty
results, are cached locally for 24 hours. Requests for a product are shared
within a tab. Failed history requests retry once; reload the page to try again
after a persistent failure.

## 6. Inspect data handling and calculation

- `manifest.json`: declares the `storage` permission and content scripts limited
  to `https://www.prisjakt.no/*`.
- `src/api.js`: sends a same-origin POST to `/api/price-history`, with the
  product ID, `timeRange: "ALL"`, and empty shop/variant filters. It omits cookies.
- `src/stats.js`: excludes membership prices, inactive offer-closing points,
  invalid/nonpositive prices, and prices below 30% of the median of the usable
  points. It selects the remaining minimum and converts øre to NOK.
- `src/cache.js`: stores results locally in browser extension storage.
- `src/dom.js` and `src/content.js`: discover prices and insert badges.
- `popup/`: contains the settings and cache controls.

There is no analytics service or developer-operated backend. Product IDs are
sent to Prisjakt for price-history retrieval. The median filter is a heuristic;
the result is not a guarantee that every historical offer was correct.

## 7. Optional automated checks from the full repository

These checks are not required to run the extension. They require the full
repository, including `package.json`, `package-lock.json`, `test/`, and `scripts/`.
The store upload ZIP intentionally contains only runtime files.

Using Node.js 22 or newer and npm, open a terminal in the repository root:

```text
npm ci
node --test test/
node scripts/smoke.cjs
```

`npm ci` installs development dependencies only; they are not bundled into the
extension. Unit tests use the included history fixture and reduced DOM samples.
The live smoke check uses network access and may fail if Prisjakt blocks
automated requests (for example, HTTP 403 on search); in that case, use the
browser checks above. Node.js 26.4.0 was used during development.

## 8. Reproduce the upload ZIP from the full repository

In PowerShell, from the repository root, run:

```powershell
.\scripts\package.ps1
```

This packages `manifest.json`, `src/`, `popup/`, and `icons/` without transforming
the source. The output is `dist/prisjakt-historical-low-<version>.zip`, with
`manifest.json` at the archive root. The version comes from the manifest.
No build command is necessary before packaging.

## Troubleshooting

If badges are missing, check that the extension is enabled, refresh the Prisjakt
tab after installation, and check the tab's developer console. Inspect the
extension itself using **Inspect** in Firefox's debugging page, or the popup's
developer tools in Chrome, for popup-related errors. The internal Prisjakt API
and page markup can change independently of the extension. An empty history
produces `Ingen prishistorikk`; a request failure produces `Kunne ikke hente`.
