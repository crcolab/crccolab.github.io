#!/usr/bin/env python3
"""Render a CRC 1200x630 text social card to a progressive JPEG.

Fills the skill's assets/og-card.html template, screenshots it
with headless Chrome, and converts the PNG with ImageMagick (or PIL as a fallback).

Example:
  python3 render_og_card.py \
    --title 孤娘的無人機藝 --subtitle "Wandering Daughter’s Warfaring" \
    --when-zh 十月 --when "OCT 17 – 25" \
    --where-strong "新北市美術館 B3" --where "New Taipei City Art Museum" \
    --where-note "AI萬物：起鼓，2026臺灣嘉年華 特別展示" \
    --out assets/2026-OCT-17-wandering-daughter-ai-for-all.jpg

Write dates with a month name (十月 / OCT), never 10/17 or 10.17: readers can't
tell MM-DD from DD-MM.
"""
import argparse
import html
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(HERE, '..', 'assets', 'og-card.html')
CHROME_CANDIDATES = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    shutil.which('google-chrome') or '',
    shutil.which('chromium') or '',
]


def repo_root():
    return subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip()


def build_html(a):
    e = html.escape
    when = ''
    if a.when or a.when_zh:
        when = f'<div class="when"><span class="zhm">{e(a.when_zh or "")}</span>{e(a.when or "")}</div>'
    where = ''
    if a.where_strong:
        where += f'<b>{e(a.where_strong)}</b>'
    if a.where:
        where += ('｜' if a.where_strong else '') + e(a.where)
    if a.where_note:
        where += ('<br>' if where else '') + e(a.where_note)
    page = open(TEMPLATE, encoding='utf-8').read()
    for key, value in {'TITLE': e(a.title), 'SUBTITLE': e(a.subtitle or ''), 'WHEN': when, 'WHERE': where}.items():
        page = page.replace('{{' + key + '}}', value)
    return page


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--title', required=True, help='main title (zh for bilingual cards)')
    p.add_argument('--subtitle', help='second-language title, shown in lime')
    p.add_argument('--when-zh', help='zh month label in the date tag, e.g. 十月')
    p.add_argument('--when', help='Latin date text, e.g. "OCT 17 – 25"')
    p.add_argument('--where-strong', help='bold lime venue text, e.g. 新北市美術館 B3')
    p.add_argument('--where', help='venue text after the bold part')
    p.add_argument('--where-note', help='second meta line, e.g. the festival name')
    p.add_argument('--out', required=True, help='output .jpg, relative to the repo root')
    p.add_argument('--png', help='also keep the rendered PNG here (for previewing)')
    a = p.parse_args()

    chrome = next((c for c in CHROME_CANDIDATES if c and os.path.exists(c)), None)
    if not chrome:
        sys.exit('No Chrome/Chromium found for headless rendering.')
    root = repo_root()
    out = os.path.join(root, a.out)

    with tempfile.TemporaryDirectory() as tmp:
        logo = open(os.path.join(root, 'assets/logo/crc-logo.svg'), encoding='utf-8').read()
        open(os.path.join(tmp, 'logo.svg'), 'w', encoding='utf-8').write(logo.replace('fill="#46288B"', 'fill="#FFFFFF"'))
        page = os.path.join(tmp, 'card.html')
        open(page, 'w', encoding='utf-8').write(build_html(a))
        png = os.path.join(tmp, 'card.png')
        subprocess.run([chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars',
                        '--force-device-scale-factor=1', '--window-size=1200,630',
                        '--virtual-time-budget=8000', f'--screenshot={png}', f'file://{page}'],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if a.png:
            shutil.copy(png, a.png)
        magick = shutil.which('magick')
        if magick:
            subprocess.run([magick, png, '-strip', '-interlace', 'JPEG', '-sampling-factor', '4:4:4',
                            '-quality', '92', out], check=True)
        else:
            from PIL import Image  # noqa: PLC0415 — only needed without ImageMagick
            Image.open(png).convert('RGB').save(out, 'JPEG', quality=92, progressive=True, optimize=True, subsampling=0)

    size = os.path.getsize(out)
    print(f'{a.out}  1200x630  {size // 1024} KB')
    if not 75_000 <= size <= 400_000:
        print('warning: outside the 75–400 KB band of neighbouring assets', file=sys.stderr)


if __name__ == '__main__':
    main()
