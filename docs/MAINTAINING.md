# Maintaining the repository

How `main` is protected and which GitHub settings back up the files in `.github/`. Contributor-facing
rules (branch names, PR titles, checks) are in [CONTRIBUTING.md](../CONTRIBUTING.md).

## What enforces what

| Guardrail | Where | Effect |
|---|---|---|
| Every change to `main` goes through a pull request | Ruleset `.github/rulesets/protect-main.json` | Nobody can push to `main` directly, force-push it or delete it |
| One approval, from a code owner | Ruleset + `.github/CODEOWNERS` | The owner reviews every PR; a new push dismisses earlier approvals |
| Checks must pass on an up-to-date branch | Ruleset + `.github/workflows/pr-checks.yml` | "Branch and title", "Tests" and "Docker build" are required; the branch must include the latest `main` |
| Linear history | Ruleset + merge setting below | PRs are squash-merged, so the PR title becomes the commit on `main` |
| The admin can still merge their own PRs | Ruleset bypass: repository **admin** role, mode *pull request* | Admins must still open a PR, but may merge it without another person's approval or with a failing check. They cannot push to `main` directly |
| Outside contributors cannot run code with secrets | Actions settings below + workflow `permissions: contents: read` | Fork PRs run with a read-only token and no secrets, after an admin approves the run |

Outside contributors have no write access to the repository: they fork it and open pull requests from
their fork, so only the owner (and anyone you later add as a collaborator) can create branches here.

## One-time setup (repository Settings)

1. **Rules → Rulesets → New ruleset → Import a ruleset**, pick `.github/rulesets/protect-main.json`,
   review it and save. The required checks only appear as "expected" after the workflow has run once
   (it runs on the first pull request). If the import rejects a field, create the ruleset by hand with
   the same rules.
2. **General → Pull Requests**: allow **squash merging** only (default message: *Pull request title*),
   untick merge commits and rebase merging, tick **Always suggest updating pull request branches**
   and **Automatically delete head branches**.
3. **Actions → General**:
   - *Fork pull request workflows from outside collaborators*: **Require approval for all external
     contributors**.
   - *Workflow permissions*: **Read repository contents and packages permissions**; leave "Allow GitHub
     Actions to create and approve pull requests" unticked.
4. **Code security**: enable **Private vulnerability reporting**, **Dependabot alerts** and **Secret
   scanning** with **push protection** (all free on public repositories).
5. **Issues → Labels**: make sure `bug`, `enhancement`, `content` and `new-trail` exist; the issue forms
   in `.github/ISSUE_TEMPLATE/` apply them.

## Day to day

- Work on a branch named per CONTRIBUTING.md (`feature/<area>/<description>`, `fix/…`, `content/…`),
  open a PR, wait for the checks, then merge. As admin you can merge your own PR: GitHub shows the
  bypass option ("Merge without waiting for requirements to be met").
- When a trail gets its own maintainer, add a line for its folder to `.github/CODEOWNERS` and give that
  person *Write* access; they can then approve PRs for that trail.
- If you rename a job in `pr-checks.yml`, update the required checks in the ruleset at the same time,
  or every PR will wait for a check that never comes.
