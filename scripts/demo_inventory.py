"""Validate the demo HTML contract and inventory immutable build files."""

from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
from urllib.parse import urljoin, urlsplit

DIST = Path(__file__).resolve().parents[1] / "dist"
CANONICAL = "https://demos.chankay.com/bezier/"
GATEWAY_HOST = "chankay-demos.navelorange1999.workers.dev"
MIME = {
    ".css": "text/css",
    ".html": "text/html",
    ".ico": "image/x-icon",
    ".js": "application/javascript",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json",
}


class Template(HTMLParser):
    def __init__(self):
        super().__init__()
        self.markers = []
        self.urls = []
        self.manifests = []
        self.canonicals = []
        self.section = None
        self.div_depth = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in {"head", "body"}:
            self.section = tag
        if tag == "meta" and attrs.get("name") == "chankay-shell":
            self.markers.append((self.section, attrs.get("content")))
        if tag == "div":
            if "data-shell-slot" in attrs or attrs.get("id") == "app":
                if self.div_depth:
                    raise ValueError("Shell slots and Vue host must be sibling containers")
                self.markers.append((self.section, attrs.get("data-shell-slot", "app")))
            self.div_depth += 1
        if tag == "link":
            if attrs.get("rel") == "canonical":
                self.canonicals.append(attrs["href"])
            else:
                self.urls.append(attrs["href"])
            if attrs.get("rel") == "manifest":
                self.manifests.append(attrs["href"])
        if tag == "script" and "src" in attrs:
            self.urls.append(attrs["src"])
        if tag == "meta" and (attrs.get("property") == "og:image" or attrs.get("name") == "twitter:image"):
            self.urls.append(attrs["content"])

    def handle_endtag(self, tag):
        if tag == "div":
            self.div_depth -= 1
        if tag in {"head", "body"}:
            self.section = None


def main():
    release = os.environ.get("DEMO_RELEASE", "")
    if not re.fullmatch("[a-f0-9]{40}", release):
        raise ValueError("Expected a 40-character release ID")
    files = {}
    for item in sorted(DIST.rglob("*")):
        if item.is_symlink():
            raise ValueError("Build output contains a symbolic link")
        if item.is_dir() or item == DIST / "release.json":
            continue
        path = item.relative_to(DIST).as_posix()
        if item.suffix not in MIME or not re.fullmatch(r"[A-Za-z0-9_-][A-Za-z0-9_./-]*", path):
            raise ValueError("Unexpected output file")
        blob = item.read_bytes()
        files[path] = dict(path=path, size=len(blob), sha256=sha256(blob).hexdigest(), contentType=MIME[item.suffix])

    template = Template()
    template.feed((DIST / "index.html").read_text())
    expected = [("head", "v1"), ("body", "header"), ("body", "app"), ("body", "footer")]
    if template.markers != expected or template.canonicals != [CANONICAL]:
        raise ValueError("Invalid shell slots, Vue host, or canonical URL")
    if len(template.manifests) != 1:
        raise ValueError("Expected one web manifest")

    prefix = f"/bezier/_r/{release}/"

    def asset_path(url):
        location = urlsplit(urljoin(f"https://{GATEWAY_HOST}/bezier/", url))
        if location.scheme != "https" or location.netloc != GATEWAY_HOST or not location.path.startswith(prefix):
            raise ValueError("Asset must point into the current release")
        path = location.path[len(prefix):]
        if path not in files:
            raise ValueError("Referenced asset missing from inventory")
        return path

    assets = Counter(Path(asset_path(url)).suffix for url in template.urls)
    if not assets[".css"] or not assets[".js"]:
        raise ValueError("Missing application CSS or JavaScript")
    manifest_url = urljoin(f"https://{GATEWAY_HOST}/bezier/", template.manifests[0])
    manifest = json.loads((DIST / asset_path(manifest_url)).read_text())
    for icon in manifest["icons"]:
        asset_path(urljoin(manifest_url, icon["src"]))

    inventory = {"locale": "en", "files": list(files.values())}
    (DIST / "release.json").write_text(json.dumps(inventory, indent=2) + "\n")
    print(f"Verified shell slots, release URLs and {len(files)} files for {release}")


if __name__ == "__main__":
    main()
