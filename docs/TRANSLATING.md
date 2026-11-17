# Translating the trails

Every trail is available in English, Spanish and Portuguese (the EN | ES | PT toggle in the top bar).
Each trail is written in one **source language**; the other two are generated from translations.

| Trail | Source (edit this) | Generated |
|---|---|---|
| `python` | `trails/python/content/pt.json` | `en.json`, `es.json` |
| `sql` | `trails/sql/content/pt.json` | `en.json`, `es.json` (chapter 8 stays in English in all three) |
| `data-architecture` | `trails/data-architecture/content/en/*.json` | `content/pt/`, `content/es/` |

Never edit the generated files by hand: the next merge rebuilds them from the source.

`tools/i18n.py` does the bookkeeping. Only prose is translated. Code, exercise ids, section anchors and
checks are copied from the source, so exercises behave the same and progress carries over between
languages. `i18n/<trail>.<lang>.json` records, for every translated string, a hash of the source text
it was translated from. When you edit a source string, its hash no longer matches, and only that string
is sent for translation again.

## The loop

```bash
python tools/i18n.py status            # what is missing or out of date (exit code 1 if anything is)
python tools/i18n.py extract           # writes i18n-work/<trail>/<lang>/chunkNN.src.json
#   translate every chunkNN.src.json into chunkNN.out.json next to it (rules below)
python tools/i18n.py check             # keys and markup of the translations
python tools/i18n.py merge             # rebuilds the generated files and i18n/; then delete i18n-work/
```

All commands take trail ids to limit the work, e.g. `python tools/i18n.py extract data-architecture`.
Until a string is translated, the generated file shows the source text in its place.

A chunk is a flat JSON object `{ "key": "source text" }` of about 34 KB. The keys encode where a
string lives (`c4.b12.text`, `iceberg-internals.b7.r2.1`); don't change them. Chunks are a good unit to
hand to a translator, or to an AI agent with these rules.

## Rules for translators

1. Write a JSON object with **exactly the same keys** as the source chunk, every value translated.
   Strict JSON, UTF-8.
2. **Keep inline markup exactly:** `**bold**`, `*italic*` and `` `code` `` spans. Text inside backticks
   is code and is copied byte for byte, including Portuguese identifiers such as `clientes` or
   `itens_pedido`. `check` rejects changed backtick spans and different `**` counts.
3. Keep circled numbers (❶ ❷ …), arrows, version numbers, chapter and section numbers ("4.2.", "22.3")
   as they are. When the source is English, the merge converts thousands separators for Portuguese and
   Spanish ("1,440" becomes "1.440"); don't do it by hand.
4. Keep product and tool names (PostgreSQL, Snowflake, Apache Iceberg, dbt, Kafka…) and the technical
   terms practitioners use in English: window functions, lakehouse, pipeline, snapshot, watermark,
   backfill, and the medallion layers **bronze / silver / gold** (Portuguese uses the feminine article:
   "a camada silver", "a gold").
5. Labels: "Exercício 3 - …" / "Desafio 2 - …" become "Exercise 3 - …" / "Challenge 2 - …" (en) and
   "Ejercicio 3 - …" / "Desafío 2 - …" (es).
6. Spanish is neutral and addresses the reader as **tú** (Diseña, Elige, tu equipo), never *usted* or
   *vosotros*. Portuguese is Brazilian and addresses the reader as **você**.
7. Same tone as the source: clear, direct teaching prose. Don't summarize, shorten or add notes.
   Column names and sample values that the SQL examples use stay as they are, even in table cells.
8. Where the text is about mistakes or responsibility, refer to teams, never to named people.

## Adding a language or a trail

The languages of the toggle are listed in `engine/trails.py` (`LANGUAGES`) and
`engine/web/trail-hub.js` (`LANGS`). To translate a new trail, add it to `CONFIG` in `tools/i18n.py`
with its content kind, source language and targets, and make its page load `content/<TRAIL.lang>…`
(see the Data Architecture page for a reader that falls back to the source language).
