"""Render the same course entry for the local hub and the static site."""
import json
import re

STYLE_MARKER = '<!-- course styles -->'


def inject(html: str, snippet: str) -> str:
    """Insert a snippet before the closing head tag outside HTML comments."""
    for match in re.finditer(r'<!--.*?-->|</head\s*>', html, flags=re.S | re.I):
        if not match[0].startswith('<!--'):
            return html[:match.start()] + snippet + '\n' + html[match.start():]
    return snippet + '\n' + html


def safe_json(value) -> str:
    return json.dumps(value, ensure_ascii=False).replace('</', '<\\/')


def render_course_page(html: str, context: dict, base: str, hub_script: str,
                       token: str | None = None) -> str:
    theme = f'<link rel="stylesheet" href="{base}hub/theme.css">'
    if STYLE_MARKER in html:
        styles = theme + f'\n<link rel="stylesheet" href="{base}hub/course.css">'
        html = html.replace(STYLE_MARKER, styles, 1)
        theme = ''
    token_script = f'window.LAB_TOKEN = {safe_json(token)};\n' if token is not None else ''
    snippet = (
        f'{theme}\n<script>{token_script}window.COURSE = window.TRAIL = {safe_json(context)};</script>\n'
        f'<script>{hub_script}</script>'
    )
    return inject(html, snippet.lstrip())
