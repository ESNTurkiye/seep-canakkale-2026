# The site is a Next.js static export with a build-time image pipeline

The site will be hosted on ESN Türkiye's own infrastructure, and we do not yet know whether that infrastructure can run Node. Rather than block on the answer, we build the site so the answer stops mattering: Next.js with `output: 'export'`, producing plain HTML, CSS, JS and images that serve identically from shared hosting, a VPS behind nginx, or a platform host. Nothing on the site needs a server — it is nine scenes, roughly twenty-five images and one outbound link.

## Consequences

- **`next/image` optimisation is unavailable.** We generate AVIF and WebP variants at build time with `sharp` and serve them via plain `<picture>`/`srcset`. This is not optional decoration: the museum zoom needs 3–4K source artwork, which is unshippable to mobile unstyled.
- **No API routes, no server actions.** If Phase 2 needs an application or feedback form, it uses an external service or a separate endpoint — it does not pull the site back onto a Node server.
- Handover to next year's team is a matter of copying a folder, which matters in an organisation with annual turnover.
