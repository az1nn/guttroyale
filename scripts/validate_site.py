#!/usr/bin/env python3
from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML_PATH = ROOT / "index.html"
CSS_PATH = ROOT / "style.css"


class SiteAuditParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: list[str] = []
        self.anchor_refs: list[str] = []
        self.local_refs: list[tuple[str, str]] = []
        self.errors: list[str] = []
        self.meta: dict[str, str] = {}
        self.canonical: str | None = None
        self.lang: str | None = None
        self.h1_count = 0
        self.title_count = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)

        if tag == "html":
            self.lang = data.get("lang")

        element_id = data.get("id")
        if element_id:
            self.ids.append(element_id)

        if tag == "h1":
            self.h1_count += 1
        elif tag == "title":
            self.title_count += 1

        if tag == "img" and "alt" not in data:
            self.errors.append(f"img sem atributo alt: {data.get('src', '<sem src>')}")

        if data.get("target") == "_blank":
            rel = set((data.get("rel") or "").split())
            if "noopener" not in rel:
                self.errors.append(f"link target=_blank sem noopener: {data.get('href', '<sem href>')}")

        if tag == "a":
            href = data.get("href")
            if href and href.startswith("#") and len(href) > 1:
                self.anchor_refs.append(href[1:])

        if tag == "meta":
            key = data.get("name") or data.get("property")
            value = data.get("content")
            if key and value:
                self.meta[key] = value

        if tag == "link":
            rel = set((data.get("rel") or "").split())
            if "canonical" in rel:
                self.canonical = data.get("href")

        for attr in ("src", "href"):
            ref = data.get(attr)
            if ref:
                self._record_local_ref(tag, ref)

    def _record_local_ref(self, tag: str, ref: str) -> None:
        if ref.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
            return
        parsed = urlparse(ref)
        if parsed.scheme or parsed.netloc:
            return
        if not parsed.path:
            return
        self.local_refs.append((tag, unquote(parsed.path)))


def is_external(ref: str) -> bool:
    parsed = urlparse(ref)
    return bool(parsed.scheme or parsed.netloc) or ref.startswith(("data:", "#", "%23"))


def main() -> int:
    parser = SiteAuditParser()
    html = HTML_PATH.read_text(encoding="utf-8")
    parser.feed(html)
    errors = list(parser.errors)

    duplicates = [value for value, count in Counter(parser.ids).items() if count > 1]
    if duplicates:
        errors.append("IDs duplicados: " + ", ".join(sorted(duplicates)))

    known_ids = set(parser.ids)
    missing_anchors = sorted(set(parser.anchor_refs) - known_ids)
    if missing_anchors:
        errors.append("Âncoras sem destino: " + ", ".join(missing_anchors))

    for tag, ref in parser.local_refs:
        path = ROOT / ref.lstrip("/")
        if not path.exists():
            errors.append(f"referência local inexistente em <{tag}>: {ref}")

    if parser.lang != "pt-BR":
        errors.append(f"lang esperado pt-BR, encontrado {parser.lang!r}")
    if parser.h1_count != 1:
        errors.append(f"esperado exatamente 1 h1, encontrado {parser.h1_count}")
    if parser.title_count != 1:
        errors.append(f"esperado exatamente 1 title, encontrado {parser.title_count}")

    required_meta = [
        "description",
        "og:title",
        "og:description",
        "og:url",
        "og:image",
        "twitter:card",
        "twitter:title",
        "twitter:description",
        "twitter:image",
    ]
    for key in required_meta:
        if not parser.meta.get(key):
            errors.append(f"metadado obrigatório ausente: {key}")

    for key in ("og:url", "og:image", "twitter:image"):
        value = parser.meta.get(key, "")
        if value and not value.startswith("https://"):
            errors.append(f"{key} deve usar URL HTTPS absoluta: {value}")

    if not parser.canonical or not parser.canonical.startswith("https://"):
        errors.append("canonical HTTPS absoluto ausente")

    legacy_refs = ("index.html.html", "assets/prince-gutt.png")
    for legacy_ref in legacy_refs:
        if legacy_ref in html:
            errors.append(f"referência legada encontrada no HTML: {legacy_ref}")

    css = CSS_PATH.read_text(encoding="utf-8")
    for match in re.finditer(r"url\(\s*['\"]?([^)'\"\s]+)", css):
        ref = match.group(1)
        if is_external(ref):
            continue
        path = ROOT / unquote(urlparse(ref).path).lstrip("/")
        if not path.exists():
            errors.append(f"referência local inexistente no CSS: {ref}")

    if errors:
        print("Site audit: FAIL")
        for error in errors:
            print(f" - {error}")
        return 1

    print(
        "Site audit: OK "
        f"({len(parser.ids)} ids, {len(parser.local_refs)} referências locais, "
        f"{len(parser.meta)} metadados)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
