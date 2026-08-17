# Generated-image masters stay out of git; only web-sized derivatives are committed

Every scene artwork is generated at a large master resolution (5504 × 3072, well past the 3840px floor the art direction requires) and then downsized to a ~2000px-wide web variant for `public/artwork/`. The site never serves the master. Frames are a separate case: they're generated once, directly at their final ~2000px size, with no master step — a 9-sliced frame gains nothing from starting at 4K, so there's no `assets/artwork-masters/` file for either frame. For scene artwork, the master is an input to the web derivation, not a deliverable, in exactly the same sense as the OC source photographs in `assets/source-photos/` (see `docs/adr/0002-ai-generated-oc-portraits.md`): both are working material a generation step consumes, not something the site ships.

Masters therefore live in `assets/artwork-masters/`, which is gitignored.

This is not a size argument — a handful of 4K JPEGs would not meaningfully bloat the repository on their own. It is a churn argument. Nine artworks each get reviewed and regenerated a few times before the set holds together as one collection (see the art-direction rules on consistent light and palette). If masters were committed, git would keep every rejected and superseded version of every painting forever — history that grows with every future regeneration and is paid for, permanently, by every future `git clone`. Keeping masters out of git means only the current, chosen web-sized asset is ever in the repository; the discarded attempts cost nothing once discarded.

## Consequences

- `assets/artwork-masters/` is gitignored, matching `assets/source-photos/`.
- Only web-sized assets are committed: a base image plus its derived variants, in `public/artwork/` and `public/frames/`. That's what the site reads and what ships in the repository — never a master.
- Masters cannot live solely on the machine of whoever last regenerated them; the next person to touch an artwork needs access to the same masters, not a fresh 4K re-render from scratch. A shared archive location is required.
- **TODO: name the shared archive location for `assets/artwork-masters/` in `docs/art-direction.md`.** Not decided yet — do not invent one. Until it exists, masters are only as durable as the laptop that generated them.
