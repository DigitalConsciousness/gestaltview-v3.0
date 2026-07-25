#!/usr/bin/env python3
"""
GestaltView SEO + Accessibility Crawler
Author: Built for Keith Soyka / GestaltView
Version: 2.0 — June 2026

Crawls https://gestaltview-di-gsvw.vercel.app/
Audits every discovered page for:
  - SEO: title, meta description, H1-H6 hierarchy, canonical, OG tags,
         image alt text, internal links, status codes
  - Accessibility: ARIA labels, form labeling, reading level,
                   motion flags, cognitive load indicators,
                   GestaltView-specific term surface check
  - Output: CSV report + JSON summary, timestamped, ready for
            diligence workbook ingestion

Requirements:
  pip install httpx beautifulsoup4 pandas textstat openpyxl
  
No Playwright required for v1 — pure HTML parsing.
Add Playwright layer for v2 to audit React-rendered components.
"""

import httpx
import asyncio
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import pandas as pd
import textstat
import json
import csv
from datetime import datetime, timezone
from collections import deque
from pathlib import Path
import re
import time
import os

# ── CONFIG ──────────────────────────────────────────────────────────────────

BASE_URL = os.getenv("GESTALTVIEW_BASE_URL", "https://gestaltview-v2-0-nine.vercel.app").rstrip("/")
MAX_PAGES = 80          # safety cap — increase once verified working
CRAWL_DELAY = 1.0       # seconds between requests — be polite to Vercel
OUTPUT_DIR = Path("gestaltview_audit")
TIMESTAMP = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

# GestaltView-specific terms that SHOULD appear in meta/headings
# Crawler flags pages where none of these surface in SEO-visible text
GV_CORE_TERMS = [
    "GestaltView", "Personal Language Key", "PLK", "consciousness-serving",
    "SymbioCoder", "Billy", "Loom", "neurodivergent", "Tribunal",
    "ADHD", "Alzheimer", "Resume Rockstar", "Keith Soyka",
    "Brain Sparks", "Bucket Drop", "Validation Wall"
]

# WCAG-adjacent: interactive components that MUST have ARIA labels
INTERACTIVE_COMPONENTS = [
    "BrainSparksStation", "ValidationWall", "AIChat",
    "BillysRoom", "PLKAnalyzer", "AudioPlayer", "AddictionRecovery"
]

# Sitemap pages to guarantee coverage even if crawler misses them
KNOWN_PAGES = [
    "/",
    "/engine",
    "/billy",
    "/agent-trainer",
    "/agent-trainer/runtime",
    "/agent-trainer/pricing",
    "/agent-trainer/package-builder",
    "/pricing",
    "/demo",
    "/signup",
    "/codex",
    "/continuum-codex",
    "/record",
    "/collaboration-proof",
    "/resonance-loop",
    "/ethics-framework",
    "/tribunal-of-understanding",
    "/tribunal",
    "/orientation",
    "/exhibits",
    "/alzheimers-legacy",
    "/addiction-recovery",
    "/adhd-powerup",
    "/brain-sparks",
    "/brain-sparks-station",
    "/musical-dna",
    "/symbiocoder",
    "/vibe-coder",
    "/resume-rockstar",
    "/validation-wall",
    "/village-builders",
    "/metrics-dashboard",
    "/heirloom-companion",
    "/bucket-drops",
    "/gravity",
    "/consulting",
    "/external-scaffold",
    "/sanctuary",
    "/origin",
    "/pull-string",
    "/blackboard-room",
    "/transcriptory",
    "/artifact-gallery",
    "/dynamic-inner-world",
    "/digital-intelligence-academy",
    "/embodiment-studio",
    "/living-legacy",
    "/rapid-prototype",
    "/adaptive-layout",
    "/creation-corner",
    "/workspace-analysis",
    "/billy/voicestudio",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
]


# ── UTILITIES ────────────────────────────────────────────────────────────────

def is_internal(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.netloc == "" or BASE_URL in url


def normalize_url(url: str, base: str) -> str:
    full = urljoin(base, url)
    # Strip fragments and trailing slashes for deduplication
    parsed = urlparse(full)
    return parsed._replace(fragment="").geturl().rstrip("/")


def reading_level(text: str) -> dict:
    if not text or len(text.split()) < 20:
        return {"flesch_kincaid_grade": None, "flesch_reading_ease": None}
    stats = textstat.Textstat()
    return {
        "flesch_kincaid_grade": round(stats.flesch_kincaid_grade(text), 1),
        "flesch_reading_ease": round(stats.flesch_reading_ease(text), 1),
    }


def check_motion_flags(soup: BeautifulSoup) -> list:
    """Flag animation/transition CSS that lacks prefers-reduced-motion."""
    flags = []
    style_tags = soup.find_all("style")
    inline_styles = [tag.get("style", "") for tag in soup.find_all(style=True)]
    all_css = " ".join([s.get_text() for s in style_tags] + inline_styles)
    
    has_animation = bool(re.search(r'animation|transition|@keyframes', all_css))
    has_motion_query = bool(re.search(r'prefers-reduced-motion', all_css))
    
    if has_animation and not has_motion_query:
        flags.append("MOTION: animation/transition detected without prefers-reduced-motion query")
    return flags


def check_gv_term_surface(soup: BeautifulSoup, url: str) -> list:
    """Check if GestaltView core terms surface in SEO-visible locations."""
    seo_text = " ".join([
        soup.title.get_text() if soup.title else "",
        soup.find("meta", {"name": "description"})["content"]
            if soup.find("meta", {"name": "description"}) else "",
        " ".join([h.get_text() for h in soup.find_all(["h1","h2","h3"])])
    ]).lower()
    
    found = [t for t in GV_CORE_TERMS if t.lower() in seo_text]
    missing = [t for t in GV_CORE_TERMS if t.lower() not in seo_text]
    
    if not found:
        return [f"GV_TERMS: No core GestaltView terms found in SEO-visible text on {url}"]
    return []


def check_aria(soup: BeautifulSoup) -> list:
    """Basic ARIA audit — interactive elements missing labels."""
    issues = []
    
    # Buttons without accessible name
    buttons = soup.find_all("button")
    for btn in buttons:
        has_label = (
            btn.get("aria-label") or
            btn.get("aria-labelledby") or
            btn.get_text(strip=True)
        )
        if not has_label:
            issues.append(f"ARIA: <button> missing accessible name at '{btn}'")
    
    # Inputs without labels
    inputs = soup.find_all("input", {"type": lambda t: t not in ["hidden", "submit"]})
    for inp in inputs:
        inp_id = inp.get("id")
        has_label = (
            inp.get("aria-label") or
            inp.get("aria-labelledby") or
            inp.get("placeholder") or
            (inp_id and soup.find("label", {"for": inp_id}))
        )
        if not has_label:
            issues.append(f"ARIA: <input> missing label (id={inp_id or 'none'})")
    
    # Images without alt text
    imgs = soup.find_all("img")
    for img in imgs:
        if not img.get("alt") and img.get("alt") != "":
            src = img.get("src", "unknown")[:60]
            issues.append(f"ARIA/SEO: <img> missing alt text: {src}")
    
    return issues


def analyze_headings(soup: BeautifulSoup) -> dict:
    """Audit H1–H6 hierarchy for SEO and cognitive structure."""
    headings = {}
    issues = []
    
    for level in range(1, 7):
        tags = soup.find_all(f"h{level}")
        headings[f"h{level}_count"] = len(tags)
        headings[f"h{level}_text"] = " | ".join(
            [t.get_text(strip=True)[:80] for t in tags[:3]]
        )
    
    if headings["h1_count"] == 0:
        issues.append("SEO: No H1 tag found")
    elif headings["h1_count"] > 1:
        issues.append(f"SEO: Multiple H1 tags ({headings['h1_count']}) — should be one per page")
    
    # Check for heading level skips (e.g., H1 → H3 with no H2)
    prev_level = 0
    for level in range(1, 7):
        if headings[f"h{level}_count"] > 0:
            if prev_level > 0 and level > prev_level + 1:
                issues.append(
                    f"ACCESSIBILITY: Heading level skip H{prev_level}→H{level} (cognitive structure gap)"
                )
            prev_level = level
    
    headings["heading_issues"] = " | ".join(issues)
    return headings


def audit_meta(soup: BeautifulSoup) -> dict:
    """Audit all SEO meta tags."""
    result = {}
    
    # Title
    title_tag = soup.find("title")
    result["title"] = title_tag.get_text(strip=True) if title_tag else ""
    result["title_length"] = len(result["title"])
    result["title_ok"] = "✓" if 30 <= result["title_length"] <= 60 else "⚠ length"
    
    # Meta description
    desc = soup.find("meta", {"name": "description"})
    result["meta_description"] = desc["content"] if desc and desc.get("content") else ""
    result["meta_description_length"] = len(result["meta_description"])
    result["meta_description_ok"] = (
        "✓" if 120 <= result["meta_description_length"] <= 160 else "⚠ length"
    )
    
    # Canonical
    canonical = soup.find("link", {"rel": "canonical"})
    result["canonical"] = canonical["href"] if canonical and canonical.get("href") else "MISSING"
    
    # OG tags
    og_title = soup.find("meta", {"property": "og:title"})
    og_desc = soup.find("meta", {"property": "og:description"})
    og_image = soup.find("meta", {"property": "og:image"})
    result["og_title"] = og_title["content"] if og_title and og_title.get("content") else "MISSING"
    result["og_description"] = og_desc["content"] if og_desc and og_desc.get("content") else "MISSING"
    result["og_image"] = og_image["content"] if og_image and og_image.get("content") else "MISSING"
    
    # Robots
    robots = soup.find("meta", {"name": "robots"})
    result["robots"] = robots["content"] if robots and robots.get("content") else "not set"
    
    return result


# ── CORE CRAWLER ─────────────────────────────────────────────────────────────

async def crawl_page(client: httpx.AsyncClient, url: str) -> dict:
    """Crawl a single page and return a full audit record."""
    record = {
        "url": url,
        "status_code": None,
        "crawled_at": datetime.now(timezone.utc).isoformat(),
        "issues": [],
        "discovered_links": [],
    }
    
    try:
        response = await client.get(url, follow_redirects=True, timeout=15.0)
        record["status_code"] = response.status_code
        record["final_url"] = str(response.url)
        record["redirect"] = url != str(response.url)
        
        if response.status_code != 200:
            record["issues"].append(f"HTTP {response.status_code}")
            return record
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        # ── SEO AUDIT ──
        meta = audit_meta(soup)
        record.update(meta)
        
        headings = analyze_headings(soup)
        record.update(headings)
        
        # ── CONTENT ──
        body_text = soup.get_text(separator=" ", strip=True)
        word_count = len(body_text.split())
        record["word_count"] = word_count
        record["cognitive_load_flag"] = (
            "⚠ HIGH (>1000 words)" if word_count > 1000 else "OK"
        )
        
        rl = reading_level(body_text)
        record["flesch_kincaid_grade"] = rl["flesch_kincaid_grade"]
        record["flesch_reading_ease"] = rl["flesch_reading_ease"]
        if rl["flesch_kincaid_grade"] and rl["flesch_kincaid_grade"] > 12:
            record["issues"].append(
                f"READABILITY: Grade level {rl['flesch_kincaid_grade']} — consider simplifying for neurodivergent accessibility"
            )
        
        # ── ACCESSIBILITY AUDIT ──
        aria_issues = check_aria(soup)
        record["issues"].extend(aria_issues)
        record["aria_issue_count"] = len(aria_issues)
        
        motion_issues = check_motion_flags(soup)
        record["issues"].extend(motion_issues)
        
        # ── GV-SPECIFIC AUDIT ──
        gv_issues = check_gv_term_surface(soup, url)
        record["issues"].extend(gv_issues)
        
        # Internal link discovery
        links = soup.find_all("a", href=True)
        internal = [
            normalize_url(a["href"], url)
            for a in links
            if is_internal(a["href"]) and not a["href"].startswith("#")
        ]
        record["discovered_links"] = list(set(internal))
        record["internal_link_count"] = len(internal)
        
        # Broken link candidates (non-anchor hrefs that 404)
        record["external_link_count"] = len([
            a for a in links
            if not is_internal(a["href"]) and a["href"].startswith("http")
        ])
        
        # Image audit
        imgs = soup.find_all("img")
        record["total_images"] = len(imgs)
        record["images_missing_alt"] = len([
            i for i in imgs if not i.get("alt") and i.get("alt") != ""
        ])
        
        # Structured data
        ld_json = soup.find("script", {"type": "application/ld+json"})
        record["has_structured_data"] = "✓" if ld_json else "MISSING"
        
        record["issue_count"] = len(record["issues"])
        record["issues_summary"] = " || ".join(record["issues"])
        
    except httpx.TimeoutException:
        record["issues"].append("TIMEOUT: Page took >15s to respond")
        record["status_code"] = "TIMEOUT"
    except Exception as e:
        record["issues"].append(f"CRAWL ERROR: {str(e)[:100]}")
        record["status_code"] = "ERROR"
    
    return record


async def run_crawler():
    """Main crawl loop — BFS from BASE_URL, respects MAX_PAGES cap."""
    
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Seed queue with known pages + home
    seed_urls = [normalize_url(p, BASE_URL) for p in KNOWN_PAGES]
    queue = deque(seed_urls)
    visited = set(seed_urls)
    results = []
    
    headers = {
        "User-Agent": "GestaltViewAuditBot/1.0 (SEO+Accessibility Crawler; solo founder audit)",
        "Accept": "text/html,application/xhtml+xml",
    }
    
    async with httpx.AsyncClient(headers=headers) as client:
        while queue and len(results) < MAX_PAGES:
            url = queue.popleft()
            print(f"[{len(results)+1}/{MAX_PAGES}] Crawling: {url}")
            
            record = await crawl_page(client, url)
            results.append(record)
            
            # Add newly discovered internal links to queue
            for link in record.get("discovered_links", []):
                if link not in visited and BASE_URL in link:
                    visited.add(link)
                    queue.append(link)
            
            await asyncio.sleep(CRAWL_DELAY)
    
    return results


# ── OUTPUT ───────────────────────────────────────────────────────────────────

def save_outputs(results: list):
    """Save CSV audit report + JSON summary."""
    
    # Flatten for CSV
    flat = []
    for r in results:
        row = {k: v for k, v in r.items() if k not in ["discovered_links", "issues"]}
        flat.append(row)
    
    # ── CSV ──
    csv_path = OUTPUT_DIR / f"gestaltview_seo_audit_{TIMESTAMP}.csv"
    if flat:
        fieldnames = list(flat[0].keys())
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(flat)
        print(f"\n✓ CSV saved: {csv_path}")
    
    # ── JSON SUMMARY ──
    total = len(results)
    pages_with_issues = len([r for r in results if r.get("issue_count", 0) > 0])
    all_issues = []
    for r in results:
        for issue in r.get("issues", []):
            all_issues.append({"url": r["url"], "issue": issue})
    
    summary = {
        "crawl_timestamp": TIMESTAMP,
        "base_url": BASE_URL,
        "pages_crawled": total,
        "pages_with_issues": pages_with_issues,
        "total_issues_found": len(all_issues),
        "issue_breakdown": {
            "seo": len([i for i in all_issues if i["issue"].startswith("SEO:")]),
            "aria_accessibility": len([i for i in all_issues if i["issue"].startswith("ARIA")]),
            "readability": len([i for i in all_issues if i["issue"].startswith("READABILITY")]),
            "motion": len([i for i in all_issues if i["issue"].startswith("MOTION")]),
            "gv_terms": len([i for i in all_issues if i["issue"].startswith("GV_TERMS")]),
            "http_errors": len([i for i in all_issues if i["issue"].startswith("HTTP")]),
        },
        "all_issues": all_issues,
        "pages_without_structured_data": [
            r["url"] for r in results if r.get("has_structured_data") == "MISSING"
        ],
        "pages_missing_h1": [
            r["url"] for r in results if r.get("h1_count", 1) == 0
        ],
        "pages_missing_canonical": [
            r["url"] for r in results if r.get("canonical") == "MISSING"
        ],
    }
    
    json_path = OUTPUT_DIR / f"gestaltview_audit_summary_{TIMESTAMP}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    print(f"✓ JSON summary saved: {json_path}")
    
    # ── CONSOLE SUMMARY ──
    print(f"""
╔══════════════════════════════════════════════════════╗
║        GestaltView SEO + Accessibility Audit         ║
╠══════════════════════════════════════════════════════╣
║  Pages crawled:          {total:<4}                       ║
║  Pages with issues:      {pages_with_issues:<4}                       ║
║  Total issues found:     {len(all_issues):<4}                       ║
╠══════════════════════════════════════════════════════╣
║  SEO issues:             {summary['issue_breakdown']['seo']:<4}                       ║
║  ARIA/accessibility:     {summary['issue_breakdown']['aria_accessibility']:<4}                       ║
║  Readability:            {summary['issue_breakdown']['readability']:<4}                       ║
║  Motion/animation:       {summary['issue_breakdown']['motion']:<4}                       ║
║  GV term surface:        {summary['issue_breakdown']['gv_terms']:<4}                       ║
║  HTTP errors:            {summary['issue_breakdown']['http_errors']:<4}                       ║
╚══════════════════════════════════════════════════════╝
    """)
    
    return csv_path, json_path


# ── ENTRY POINT ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print(f"GestaltView Audit Crawler v1.0")
    print(f"Target: {BASE_URL}")
    print(f"Output: {OUTPUT_DIR}/\n")
    
    results = asyncio.run(run_crawler())
    save_outputs(results)
