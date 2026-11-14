"""Mechanically version local JS/CSS links without rebuilding app markup."""
import hashlib
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]


class Assets(HTMLParser):
    def __init__(self, page):
        super().__init__(convert_charrefs=False)
        self.page, self.replacements = page, []

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        key = "src" if tag == "script" else "href" if tag == "link" and attrs.get("rel") == "stylesheet" else None
        if not key or key not in attrs:
            return
        old = attrs[key]
        url = urlsplit(old)
        if url.scheme or url.netloc:
            return
        target = (self.page.parent / url.path).resolve()
        if not target.is_relative_to(ROOT) or target.suffix not in (".js", ".css") or not target.is_file():
            return
        params = dict(parse_qsl(url.query))
        params["v"] = hashlib.sha256(target.read_bytes()).hexdigest()[:16]
        new = urlunsplit((url.scheme, url.netloc, url.path, urlencode(params), url.fragment))
        source = self.get_starttag_text()
        rewritten = source.replace(f'"{old}"', f'"{new}"').replace(f"'{old}'", f"'{new}'")
        if rewritten != source:
            self.replacements.append((source, rewritten))


changed = 0
for page in ROOT.rglob("*.html"):
    if ".git" in page.parts:
        continue
    original = page.read_text()
    parser = Assets(page)
    parser.feed(original)
    text = original
    for old, new in parser.replacements:
        text = text.replace(old, new)
    if text != original:
        page.write_text(text)
        changed += 1
print(f"Updated {changed} HTML files; asset versions follow content hashes.")
