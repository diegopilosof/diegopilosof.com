# LinkedIn posts on the portfolio — design

Date: 2026-08-16
Status: approved for planning

## Goal

Bring Diego's LinkedIn feed posts into diegopilosof.com in two forms:

- **Anchor posts**: 3–5 hand-picked LinkedIn posts republished as native content, each with its own permalink at `/notes/[slug]`.
- **Also on LinkedIn**: a compact list of other recent posts as link-only cards that send the reader to LinkedIn.

The single confirmed content type is short-form LinkedIn feed posts. LinkedIn Articles, newsletters and comments are out of scope for this iteration.

## Why

The site's job (per `Portfolio_Web_Brief.md`) is a 30–90 second credibility read for senior FP&A / Finance leaders. Republished anchor posts turn Diego's public thinking into archivable, shareable URLs on his own domain, while the tarjetas keep the section honest about publishing cadence without cluttering the home page.

Rejected alternatives:

- **Inline expandables** would inflate the home page, breaking symmetry with the "Worth reading" column and pushing Projects below the fold.
- **`/notes` index page** is premature at 3–5 anchor posts. Adds a page whose only content is a list. Can be bolted on later when publication volume justifies it.
- **LinkedIn iframe embeds** clash with the site's typographic look and add third-party scripts the brief has resisted so far.

## Scope

In:

- Extend `writing` content collection schema with a third `kind` (`anchor`) plus a `linkedin_url` field.
- Update the `Inputs` section on the home page: left column shows anchor posts with excerpts + a divider + secondary list of "Also on LinkedIn" tarjetas.
- New route `src/pages/notes/[slug].astro` with reading-optimized layout and canonical link to LinkedIn.
- Documentation update: how to publish a new post (anchor vs tarjeta vs recommended).

Out:

- Automated import from LinkedIn (no API, no scraping, no RSS).
- A `/notes` index page.
- LinkedIn Articles, newsletters, comments.
- Engagement metrics ("523 likes"), reactions, or comment counts.
- Cover images per post.
- Home-page pagination or filtering.

## Content model

Extend the existing `writing` collection in `src/content.config.ts`:

```ts
const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z.object({
    kind: z.enum(["anchor", "linkedin", "recommended"]),
    title: z.string(),
    published: z.coerce.date(),
    description: z.string(),
    link: z.string().url().optional(),          // used by kind: linkedin | recommended
    linkedin_url: z.string().url().optional(),  // used by kind: anchor (canonical + "view original")
    author: z.string().optional(),              // used by kind: recommended
    source: z.string().optional(),              // used by kind: recommended
  }),
});
```

Validation rules enforced at query time in `Writing.astro` and `[slug].astro`:

- `kind: anchor` MUST have `linkedin_url`. Body Markdown MUST be non-empty.
- `kind: linkedin` MUST have `link`. Body Markdown is ignored.
- `kind: recommended` MUST have `link`. Body Markdown is ignored.

The existing `2026-04-finance-engineer.md` is already `kind: recommended` and passes as-is. No content migration needed.

## Home-page section (`Inputs`)

The section keeps its id (`#inputs`), header ("Inputs" / "What I'm reading and posting") and two-column layout when both sides have content.

Left column ("Recent on LinkedIn") gets two sub-blocks:

**Sub-block A — Anchor posts (top of column):**

- Rendered from `kind === "anchor"`, sorted by `published` desc, up to 5 on the home page.
- Each entry: title (bold, larger), fecha (monospace, muted, right-aligned), 2–3 line excerpt from `description`, and a `→ Read on site` link to `/notes/[slug]`. No external-link arrow.

**Divider**: reuses the existing muted-label pattern in the file (`h3.font-mono.text-xs.uppercase.tracking-[0.2em].text-text-muted`) with the label "Also on LinkedIn". No `<hr>` — the vertical rhythm and the label alone provide the separation, matching the "Recent on LinkedIn" / "Worth reading" style already used at column heads.

**Sub-block B — Tarjetas (below the divider):**

- Rendered from `kind === "linkedin"`, sorted by `published` desc, up to 3 on the home page.
- Each entry: single-line title with `↗` external arrow and monospace fecha on the right. No excerpt.

Bottom of column keeps the existing `See all activity on LinkedIn ↗` link.

Right column ("Worth reading") is unchanged.

Empty-state behavior: if there are no anchor and no linkedin posts, the whole left column collapses (same conditional pattern already in `Writing.astro`).

## Route `/notes/[slug]`

New file: `src/pages/notes/[slug].astro`.

- `getStaticPaths()` iterates `getCollection("writing", p => p.data.kind === "anchor")` and emits one static page per anchor post.
- Slug derivation: the file basename (e.g. `2026-08-deferred-revenue-cutoff.md`) is stripped of any leading `YYYY-MM-` date prefix to produce a clean URL like `/notes/deferred-revenue-cutoff`. The date prefix in the filename stays as an at-a-glance ordering aid in the editor.
- Uses the existing `Layout.astro`. The layout must accept an optional `canonical` prop and, when present, render `<link rel="canonical" href={canonical}>` in the `<head>`.
- Reading layout: max width `max-w-2xl`, generous vertical padding, Tailwind Typography prose using site tokens. Same font stack as the rest of the site.
- Page structure:
  1. Header: `← Back to diegopilosof.com` (links to `/#inputs`), then post title, then fecha (monospace, muted).
  2. Body: Markdown rendered via Astro's built-in `<Content />`.
  3. Footer: `Originally posted on LinkedIn ↗` linking to `linkedin_url`.
- Meta tags: `<title>{post.title} · Diego Pilosof</title>`, `<meta name="description" content={post.description}>`, OG tags reusing the site's default OG image.
- Canonical: `<link rel="canonical" href={post.data.linkedin_url}>`. LinkedIn stays as the SEO source of truth; Google indexes the site page but attributes to LinkedIn.

## Author workflow

Publishing to LinkedIn is unchanged. To surface a post on the site:

- **Anchor** — create `src/content/writing/YYYY-MM-slug.md` with frontmatter (`kind: anchor`, `title`, `published`, `description` in 2-3 lines, `linkedin_url`) and paste the post body below. Commit + push. Vercel deploys.
- **Tarjeta** — same file location, `kind: linkedin`, `link: <post url>`, no body.
- **Recommended external read** — unchanged (`kind: recommended` with `author`, `source`, `link`).

No CMS, no admin panel, no scheduled sync. One `.md` per publication.

## Documentation

Update `docs/content-templates/` (or add if missing) with three template files:

- `writing-anchor.md`
- `writing-linkedin.md`
- `writing-recommended.md` (may already exist; align with schema)

Each template includes the required frontmatter fields with placeholder values and a short comment on what's required vs optional for its `kind`.

## Non-goals for this iteration

- No `/notes` index page.
- No filtering, tagging, or search on the home section.
- No RSS feed for `/notes` (defer until the section grows).
- No image support in anchor post bodies (text-only first pass; add later if a specific post needs it).

## Testing / verification

- `pnpm build` (or `npm run build`) succeeds with the new content-collection schema.
- Lighthouse mobile stays >95 on the home page and on a sample `/notes/[slug]` page.
- Manual check that the empty-state branch still works: temporarily hide all anchor + linkedin posts and confirm the left column collapses cleanly.
- Manual check on a `/notes/[slug]` page: `<link rel="canonical">` present in the rendered HTML head; `← Back` link and `Originally posted on LinkedIn` footer both work.

## Open questions (none blocking)

- Should the site file the anchor posts under `src/content/writing/` alongside recommended reads, or split into `src/content/notes/` for clarity? Kept them together for now to reuse the existing collection loader and Astro types; can split later if the folder grows past ~30 files.
