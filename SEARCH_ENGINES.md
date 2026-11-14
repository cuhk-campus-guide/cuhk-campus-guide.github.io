# Search Engine Submission

Checked on 2026-11-14 (Hong Kong time). These are submission results, not proof
of inclusion or ranking in search results.

Property: https://cuhk-campus-guide.github.io/

Sitemap: https://cuhk-campus-guide.github.io/sitemap.xml

## Google Search Console

- URL-prefix property ownership verified using the HTML meta tag in `index.html`.
- Sitemap submission acknowledged successfully; one retry was made after testing
  the file's availability. The sitemap report still says "Couldn't fetch".
- Google's live URL inspection of `sitemap.xml` reported crawl allowed, successful
  page fetch, and indexing allowed at 22:32 on 2026-11-14.
- Public HTTP checks returned 200 with `application/xml`; the XML parser validated
  all six URLs. The sitemap fetch discrepancy remains unresolved, not assumed fixed.
- The homepage indexing request was accepted into Google's priority crawl queue.
- No actual indexed page or search result has been confirmed.

## Bing Webmaster Tools

- Site ownership verified independently using the HTML meta tag in `index.html`.
- No Google Search Console data-import permission was granted.
- Sitemap submission acknowledged successfully. Final observed status: Processing.
- No actual indexed page or search result has been confirmed.

## Maintenance

Keep both the `google-site-verification` and `msvalidate.01` meta tags in the
homepage head. They are public ownership-verification markers, not private API
keys. Removing them can invalidate ownership checks.

Keep sitemap URLs public and current. Do not submit private GPS records,
contribution histories, review pages or diagnostic exports. Current submissions
include only the public map and route atlas in the three supported languages.

Review the Google sitemap error and Bing processing result in their dashboards
after the services have retried/processed them. Do not repeatedly submit an
unchanged homepage or sitemap to try to force faster indexing.

Official references:
- https://support.google.com/webmasters/answer/9008080
- https://support.google.com/webmasters/answer/7451001
- https://www2.bing.com/webmasters/help/add-and-verify-site-12184f8b
