"""Offline checks only; no search engine submission or private cloud access."""
import json
from PIL import Image
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://cuhk-campus-guide.github.io/"
PRIMARY = {"index.html": BASE, "demos/shuttle-atlas/index.html": BASE + "demos/shuttle-atlas/"}
VARIANTS = {"demos/shuttle-atlas/road-map.html", "demos/shuttle-atlas/single-line.html"}


class Head(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.meta, self.canonical, self.structured, self.title = {}, [], [], ""
        self.in_head = self.in_title = self.in_json = False
        self.json_text = ""
        self.feed(text)

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if tag == "head":
            self.in_head = True
        if not self.in_head:
            return
        if tag == "meta":
            key = attrs.get("name", attrs.get("property"))
            if key:
                assert key not in self.meta, f"duplicate meta: {key}"
                self.meta[key] = attrs.get("content", "")
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append(attrs["href"])
        if tag == "title":
            self.in_title = True
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_json, self.json_text = True, ""

    def handle_data(self, value):
        if self.in_title:
            self.title += value
        if self.in_json:
            self.json_text += value

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag == "script" and self.in_json:
            self.structured.append(json.loads(self.json_text))
            self.in_json = False
        if tag == "head":
            self.in_head = False


def main():
    documents = {str(p.relative_to(ROOT)): Head(p.read_text()) for p in ROOT.rglob("*.html") if ".git" not in p.parts}
    robots = RobotFileParser()
    robots.parse((ROOT / "robots.txt").read_text().splitlines())
    assert robots.site_maps() == [BASE + "sitemap.xml"]
    for name, doc in documents.items():
        assert len(doc.canonical) <= 1, name
        if name in PRIMARY:
            assert doc.canonical == [PRIMARY[name]], name
            assert "index" in doc.meta["robots"].split(", ") and "noindex" not in doc.meta["robots"]
            assert "CUHK" in doc.title and len(doc.meta["description"]) >= 30
            assert doc.meta["og:url"] == PRIMARY[name]
            assert doc.meta["og:site_name"] == "CUHK 校园指南"
            assert doc.meta["twitter:card"] == "summary_large_image"
            assert doc.structured and all(x["@context"] == "https://schema.org" for x in doc.structured)
            image = doc.meta["og:image"]
            assert image.startswith(BASE) and (ROOT / urlparse(image).path.lstrip("/")).is_file()
        elif name in VARIANTS:
            assert doc.canonical == [BASE + "demos/shuttle-atlas/"], name
        else:
            assert "noindex" in doc.meta.get("robots", ""), name
        # Crawlers must be able to see noindex, not be blocked before reading it.
        assert robots.can_fetch("Googlebot", BASE + name), name
    sitemap = ET.parse(ROOT / "sitemap.xml")
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [x.text for x in sitemap.findall("s:url/s:loc", ns)]
    assert sorted(urls) == sorted(PRIMARY.values()) and len(urls) == len(set(urls))
    assert "web-gps" not in " ".join(urls)
    with Image.open(ROOT / "assets/site-preview.jpg") as image:
        assert image.format == "JPEG" and image.size == (1200, 630)
    assert ET.parse(ROOT / "assets/favicon.svg").getroot().attrib["viewBox"] == "0 0 40 40"
    home = (ROOT / "index.html").read_text()
    assert "<noscript>" in home and "非校方官方服务" in home
    assert "SearchAction" not in home, "Do not advertise an unsupported URL-based search API"
    print(f"PASS: {len(documents)} pages, canonical URLs, JSON-LD, sitemap, crawler access, noindex, share image and favicon")


if __name__ == "__main__":
    main()
