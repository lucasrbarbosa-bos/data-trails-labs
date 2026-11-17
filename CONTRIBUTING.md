# Contributing to Trails Lab

Thanks for helping. Trails Lab is a set of independent learning trails (Python, SQL, Data
Architecture, and more to come) served by one local engine. Every change reaches `main` through a
pull request, and every pull request runs the checks in `.github/workflows/pr-checks.yml`.

## The flow

1. **Open an issue first** for anything bigger than a typo: use the *Bug*, *Feature*, *New trail* or
   *Content* form. Agree on the approach before writing a lot of code or content.
2. **Fork** the repository (outside contributors) or **branch** from `main` (maintainers), using the
   branch naming convention below.
3. Make the change, run the local checks (below), and open a pull request against `main` with a
   title that follows the PR title convention. Fill in the template.
4. The checks must pass and the code owner must approve. Maintainers squash-merge, so the PR title
   becomes the commit message on `main`.

## Branch names

```
<type>/<area>/<short-description>        e.g.  feature/engine/sqlite-runner
<type>/<short-description>               e.g.  fix/mobile-top-bar
```

Lowercase letters, digits and dashes; `/` only between the parts. CI rejects other names.

| Type | Use it for | Examples |
|---|---|---|
| `feature/` | New behaviour in the engine, hub, pages or tools | `feature/engine/sqlite-runner`, `feature/hub/offline-mode`, `feature/structural/new-guardrails` |
| `trail/` | A brand-new trail (the area is the trail id) | `trail/window-functions/scaffold`, `trail/go-basics/chapters-1-5` |
| `content/` | Chapters, exercises, quizzes, datasets of an existing trail | `content/data-architecture/iceberg-v3-deletes`, `content/sql/chapter-6-exercises` |
| `i18n/` | Translations and translation fixes | `i18n/python/es-review`, `i18n/data-architecture/pt-chapters-1-15` |
| `fix/` | Bugs (also accepted: `bug/`) | `fix/sql/schema-browser-mobile`, `bug/hub/token-after-restart` |
| `docs/` | Documentation only | `docs/translating-guide` |
| `ci/` | Workflows, repository automation | `ci/postgres-service` |
| `refactor/` | Internal changes with no behaviour change | `refactor/engine/runner-registry` |
| `chore/` | Dependencies, housekeeping | `chore/bump-brython` |

**Areas** are a trail id (`python`, `sql`, `data-architecture`, …) or a component: `engine`, `hub`,
`ui`, `tools`, `i18n`, `ci`, `docs`, `structural` (repository-wide changes). Keep the description short:
three to five words.

## Pull request titles

PR titles follow [Conventional Commits](https://www.conventionalcommits.org/), checked by CI:

```
<type>(<scope>): <summary in the imperative, lowercase start>
feat(engine): add a sqlite runner
trail(window-functions): add the first five chapters
content(data-architecture): cover iceberg v3 deletion vectors
i18n(python): review the spanish translation
fix(sql): keep the schema browser visible on phones
```

Types: `feat`, `fix`, `trail`, `content`, `i18n`, `docs`, `ci`, `refactor`, `test`, `chore`, `perf`.
The scope is optional and uses the same areas as branch names. Add `!` after the type or scope for a
breaking change, for example a change to the page contract or a trail's localStorage keys:
`feat(hub)!: rename the progress api`.

## Before you open the pull request

```bash
python engine/hub.py --check                   # every trail.json is valid
python -m unittest discover -s tests           # engine, hub and translation tests
python tools/i18n.py status                    # translations up to date (see docs/TRANSLATING.md)
```

With Docker running, the PostgreSQL tests run too:
`LAB_TEST_PG_URL=postgresql://lab:lab@localhost:5433/loja python -m unittest discover -s tests`.

What the checks expect:

- **New trails** follow [`docs/ADDING_A_TRAIL.md`](docs/ADDING_A_TRAIL.md): the page contract, the
  shared theme tokens and the EN | ES | PT language toggle.
- **Content in all three languages.** Edit the source language only and regenerate the others with
  `tools/i18n.py` ([`docs/TRANSLATING.md`](docs/TRANSLATING.md)). Never hand-edit generated files: a test
  fails if they differ from a rebuild. A content PR may land with translations pending (the check only
  warns), but please say so in the PR.
- **Exercises keep working.** Don't change exercise ids or localStorage keys of an existing trail;
  learners' progress depends on them.
- **No secrets, no personal data** in code, content, datasets or screenshots.

## Licensing of contributions

By contributing you agree that your contribution is licensed under the same terms as the part of the
repository it changes (see the *License* section of the [README](README.md)): code under
**AGPL-3.0-only** ([`LICENSE`](LICENSE)), course content under **CC BY-NC-SA 4.0**
([`LICENSE-CONTENT`](LICENSE-CONTENT)). Only submit work you wrote or have the right to submit.

## Conduct

Be respectful and constructive. Review the work, not the person. When something goes wrong, talk
about what the team or the process can do better, not about who made the mistake.
