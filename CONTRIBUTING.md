# Contributing

## Branches

`main` is protected by the `protect-main` ruleset: every change reaches it through a pull request with one approving review from somebody other than the last person to push, and every review thread resolved. Nobody has a bypass — not even repository maintainers.

That protection covers `main` and nothing else, which is what makes the following work:

- **`develop`** is the integration branch. It is not protected, so it can be merged into freely and at any hour.
- **Ticket branches** come off `develop` and go back into `develop`, one per issue: `<issue-number>-<short-slug>`, e.g. `11-painting-component`.
- **`develop` → `main`** is a single pull request, opened when a body of work is ready. One approval releases everything on it rather than eleven approvals releasing eleven tickets.

Two things about that final pull request, both of which have bitten people:

- **Do not push to `develop` after the approval lands.** The ruleset requires the *last* push to be approved, so a late commit silently invalidates a review that has already been given.
- **Resolve every review thread before merging.** An unresolved comment blocks the merge even when the approval is in place.

## Verifying before you push

Run the checks locally. Nothing here depends on CI, so a broken build is only caught if somebody runs it:

```
npm run verify
```

This type-checks and builds the site. Once the test tickets land it will run the test suites too.

To have it run automatically before every push:

```
git config core.hooksPath .githooks
```

That is a one-line opt-in per clone — git does not enable repository hooks by default, for good reason.

## What does not go in this repository

This repository is **public**.

- **Source photographs of Organising Committee members** are inputs and stay out of version control. Only generated portraits are published, and only after the person in them has approved their own. See `docs/adr/0002-ai-generated-oc-portraits.md`.
- **Nothing that identifies a delegate.** The site collects no data and stores none.

## Before you change something surprising

Read `docs/adr/`. Several decisions here look like oversights and are not — the absence of any 1915 imagery, the frame living outside the artwork, the refusal to scrub video with scroll, the static export with a hand-rolled image pipeline. Each has an ADR explaining what it cost to decide. `CONTEXT.md` holds the vocabulary; use its words in issues, commits and copy.
