# Prisjakt historisk lavpris

A vanilla JavaScript Manifest V3 extension for Chrome and Firefox. No build step. Adds Norwegian price comparison badges on the Prisjakt front page, category pages (category.php and /c/...), search results (/search), and product.php?p=ID pages.

## Install

For store reviewers, see [the step-by-step reviewer guide](REVIEWER_GUIDE.md).

- Chrome: open chrome://extensions, enable **Developer mode**, choose **Load unpacked**, and select this repository folder.
- Firefox: open about:debugging#/runtime/this-firefox, choose **Load Temporary Add-on**, then select manifest.json. Temporary add-ons disappear after restarting Firefox; permanent installation requires Mozilla signing.

Reload existing Prisjakt tabs after installing or updating. Open the extension popup to enable/disable badges or clear the cache. Clearing the cache triggers rescanning open Prisjakt tabs. The popup counts unexpired cached products, including products with no history.

## Calculation and display

History comes from POST /api/price-history with timeRange ALL. Prices are converted from øre to NOK. Ignore membership/paid-membership points, active:false offer-closing points, nonnumeric prices and prices <= 0. Compute the median of the remaining points (average middle pair for even counts), remove prices below 30% of that median, then select the minimum. sampleCount counts retained points. Equal minima use the first occurrence returned by the API. Date and shop come from the selected point; tooltip dates use UTC.

- Green, current <= historical low × 1.01: **Laveste pris!**
- Yellow, above 1% and <= 15%: **+N % over laveste**
- Red, above 15%: **+N % over laveste**
- Grey: loading, no usable history, or fetch failure. Failures retry once automatically; reload to retry again.

Percentages round (current − low) / low × 100. The explicit 1% badge rule is used despite a conflicting 2% styling suggestion in the brief.

Requests run eagerly with a concurrency limit of four per tab. Product IDs are deduplicated for the life of the page; results (including no-data results) are cached in storage.local for 24 hours. Expired entries are pruned on startup. Settings and cache stay locally in the browser. The extension calls only Prisjakt's same-origin endpoint, without cookies or telemetry; only the storage permission is requested.

## Development and verification

To create the store upload ZIP, run `./scripts/package.ps1` in PowerShell.
The script works from any working directory and writes
`dist/prisjakt-historical-low-<version>.zip`, using the version in manifest.json.
It includes only manifest.json, src/, popup/, and icons/, with the manifest at
the ZIP root. Running it again replaces the ZIP for that version.

Node is needed only for development. Run npm ci for the development-only HTML parser, then:

    node --test test/
    node scripts/smoke.cjs
    npx web-ext lint --source-dir . --ignore-files "node_modules/**" "test/**" "scripts/**" "package*.json"

Regenerate PNG icons with node scripts/generate-icons.cjs. Runtime files require no npm dependencies. Content scripts load in manifest order and share an isolated PJLow namespace.

The real fixture test/fixtures/4220665.json was downloaded on 11 November 2026 from the ALL endpoint (413 points). With the specified rules its low is **3,848 kr**, Christiania Glasmagasin, 12 June 2023 (393 retained points). The earlier expected ~5,990 kr does not agree with this response. The fixture is preserved in full rather than trimming away qualifying lower prices. The erroneous 179 kr point is excluded.

Live selector verification found 24 category cards with parseable prices and one product target at 5,990 kr. Category cards use article[data-test="ProductGridCard"], product.php links and StyledPrice class fallback. Product pages use [data-test="OfferListItem"] h4, selecting the lowest rendered offer price. Search returned HTTP 403 to automated fetching. Browser DOM inspection subsequently verified 50 search cards: these use div[data-test="ProductGridCard"] and [data-sentry-component="Price"] p rather than the legacy article/StyledPrice markup. Both layouts are supported; nested card wrappers and cheaper used-offer badges are excluded. The smoke script reports blocked pages and exits nonzero rather than claiming success.

## Limitations and browser checklist

The API is internal and undocumented; api.js isolates it. Site markup may change. The 30% rule is a heuristic and can retain incorrect prices or exclude real discounts; it is not a guarantee of a genuine all-time low. Variants are combined, shipping is not included, and offer filters may change which current prices are rendered. A cached low can be up to 24 hours old. New API data can change the computed low.

Manually load the extension in both browsers and verify front-page carousel badges, category badges, search results, the sample product page, dynamically loaded cards/pagination, product navigation, popup toggle, cache clearing, and tooltips. Browser installation/UI behavior has not been verified by the automated checks. Modern browsers are recommended; Firefox minimum manifest version is 109. Firefox-specific manifest settings may be reported as unsupported by Chrome and are used only by Firefox.

Firefox lint: zero errors. Two compatibility warnings remain because the requested Firefox 109 minimum predates the data_collection_permissions declaration (desktop 140 / Android 142). The declaration is included for current Firefox submission requirements; verify older browser compatibility manually.

Front-page support uses ProductCardProductName links within the Card component. Browser DOM inspection found 131 cards, 128 with displayed prices; unpriced cards are skipped. Repeated products in separate carousels each receive a badge while sharing a history request.
