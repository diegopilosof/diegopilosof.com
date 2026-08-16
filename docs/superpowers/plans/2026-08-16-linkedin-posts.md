# LinkedIn posts on the portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Republish Diego's LinkedIn feed posts on diegopilosof.com — anchor posts as native pages under `/notes/[slug]` with canonical to LinkedIn, plus a compact "Also on LinkedIn" list of link-only tarjetas in the existing Inputs section.

**Architecture:** Extends the existing `writing` content collection with a third `kind` (`anchor`) and a `linkedin_url` field. A new `src/pages/notes/[slug].astro` route generates one static page per anchor at build time, using a reading-optimized layout with a `<link rel="canonical">` pointing to LinkedIn. The `Writing.astro` component grows a second sub-block for tarjetas below the anchor list. No API, no scraping, no CMS — one `.md` per publication.

**Tech Stack:** Astro 5, Tailwind 4 (theme tokens in `src/styles/global.css`), TypeScript, Vercel static deploy. No test framework; verification via `npm run check`, `npm run build`, and inspection of generated `dist/` HTML.

## Global Constraints

- Site is at `/Users/Diego/Desktop/claude code/portfolio web/site/` — separate repo from the current worktree.
- Package manager: **npm** (per `package-lock.json`).
- All UI copy is **English**.
- **Anti-patterns to reject on sight**: LinkedIn iframe embeds, engagement metrics (likes/comments/reactions), cover images per post, home-page pagination or filtering, per-post RSS feed.
- **No new npm dependencies.** Prose typography for `/notes/[slug]` is hand-rolled with scoped CSS using the existing theme tokens — do NOT add `@tailwindcss/typography`.
- Lighthouse mobile score **>95** must survive on both the home page and any `/notes/[slug]` page.
- Home caps: **up to 5** anchor posts, **up to 3** linkedin tarjetas.
- Slug derivation: strip a leading `YYYY-MM-` prefix from the file id, e.g. `2026-08-deferred-revenue-cutoff.md` → `/notes/deferred-revenue-cutoff`. Files without a date prefix use their id as the slug unchanged.
- Anchor pages MUST set `<link rel="canonical">` to `linkedin_url` (LinkedIn stays the SEO source of truth).
- Tokens available in `global.css`: `--color-primary`, `--color-accent`, `--color-accent-2`, `--color-text-light`, `--color-text-dim`, `--color-text-muted`, `--font-sans`, `--font-mono`, `--container-prose` (38rem).
- Every task ends with `npm run check && npm run build` passing.

## File Structure

**Create:**
- `src/pages/notes/[slug].astro` — anchor post permalink page (~80 lines: getStaticPaths, header, body render, footer, scoped prose styles).
- `docs/content-templates/writing-anchor.md` — author template for anchor posts.

**Rename + edit:**
- `docs/content-templates/published.md` → `docs/content-templates/writing-linkedin.md` (update `kind: published` → `kind: linkedin`).
- `docs/content-templates/recommended.md` → `docs/content-templates/writing-recommended.md` (no content change).

**Modify:**
- `src/content.config.ts` — writing schema: rename enum member `published` → `linkedin`, add `anchor`, add optional `linkedin_url`.
- `src/components/Writing.astro` — filter on `kind === "linkedin"` (was `published`), add anchor sub-block above and tarjetas divider between.
- `src/layouts/Layout.astro` — accept optional `canonical` prop, use it if present, else fall back to the current auto-derivation.

**Boundaries:** the anchor page and the Inputs section share the content collection and nothing else. The Layout change is a small backwards-compatible prop addition consumed only by the new `[slug].astro` page.

---

## Task 1: Rename `published` → `linkedin` and add `anchor` to the writing schema

**Files:**
- Modify: `src/content.config.ts` (writing collection schema block, lines 26–37)
- Modify: `src/components/Writing.astro` (filter on `kind === "published"`, line 8)
- Test: `npm run check && npm run build`

**Interfaces:**
- Produces: `writing` collection schema now accepts `kind: "anchor" | "linkedin" | "recommended"` and a new optional `linkedin_url: string` field. Tasks 3 and 4 depend on this.
- No existing `.md` uses `kind: published` (only the recommended article exists), so no data migration is needed.

- [ ] **Step 1: Update the schema in `src/content.config.ts`**

Replace the `writing` collection block (lines 26–37) with:

```ts
const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z.object({
    kind: z.enum(["anchor", "linkedin", "recommended"]),
    title: z.string(),
    published: z.coerce.date(),
    description: z.string(),
    link: z.string().url().optional(),
    linkedin_url: z.string().url().optional(),
    author: z.string().optional(),
    source: z.string().optional(),
  }),
});
```

- [ ] **Step 2: Update the filter in `src/components/Writing.astro`**

Replace line 8 (`const published = all.filter((p) => p.data.kind === "published")`) with:

```ts
const linkedin = all
  .filter((p) => p.data.kind === "linkedin")
  .sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
```

Also rename the downstream references in the same file:
- `hasPublished` → `hasLinkedin`
- `published.map(...)` inside the left column → `linkedin.map(...)`
- The `bothColumns` calculation stays structurally the same but uses `hasLinkedin`.

Leave the rest of the file alone for now — Task 5 restructures the left column.

- [ ] **Step 3: Verify the type check and build both pass**

Run:
```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && npm run check
```
Expected: `0 errors, 0 warnings`.

Run:
```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && npm run build
```
Expected: build completes with no errors. Because no `.md` uses `kind: linkedin` yet, the left column renders empty (only the recommended column shows).

- [ ] **Step 4: Commit**

```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && \
git add src/content.config.ts src/components/Writing.astro && \
git commit -m "Rename writing kind published→linkedin, add anchor + linkedin_url"
```

---

## Task 2: Migrate the content templates

**Files:**
- Rename: `docs/content-templates/published.md` → `docs/content-templates/writing-linkedin.md`
- Rename: `docs/content-templates/recommended.md` → `docs/content-templates/writing-recommended.md`
- Create: `docs/content-templates/writing-anchor.md`
- Test: `git status`, visual read

**Interfaces:**
- Produces: three author-facing templates aligned with the new schema. No code dependency.

- [ ] **Step 1: Rename `published.md` and update its kind**

```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && \
git mv docs/content-templates/published.md docs/content-templates/writing-linkedin.md
```

Then edit `docs/content-templates/writing-linkedin.md` — change `kind: published` on line 2 to:

```
kind: linkedin
```

Leave the rest of the file as it is (it's already close enough to the linkedin card use case — title, description, date, link).

- [ ] **Step 2: Rename `recommended.md`**

```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && \
git mv docs/content-templates/recommended.md docs/content-templates/writing-recommended.md
```

No content edit needed.

- [ ] **Step 3: Create the anchor template**

Write `docs/content-templates/writing-anchor.md`:

```markdown
---
kind: anchor
title: Replace with the post title (used as page <h1> and browser tab)
published: 2026-08-16
description: Two or three lines summarizing the post. Shown as the excerpt on the home page.
linkedin_url: https://www.linkedin.com/posts/diegopilosof_post-slug-here
---

Paste the full LinkedIn post body here as Markdown.

Line breaks between paragraphs become paragraph breaks. Standard Markdown works: **bold**, *italic*, `inline code`, [links](https://example.com), and blockquotes with >.

Keep it faithful to the original — this page's canonical points to LinkedIn.
```

- [ ] **Step 4: Verify the three templates are in place**

Run:
```bash
ls "/Users/Diego/Desktop/claude code/portfolio web/site/docs/content-templates/"
```
Expected output (order may vary):
```
writing-anchor.md
writing-linkedin.md
writing-recommended.md
```

- [ ] **Step 5: Commit**

```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && \
git add docs/content-templates/ && \
git commit -m "Migrate content templates to writing-{anchor,linkedin,recommended}.md"
```

---

## Task 3: Add a `canonical` override prop to the Layout

**Files:**
- Modify: `src/layouts/Layout.astro` (lines 4–14 and line 25)
- Test: `npm run build` and grep the home page HTML

**Interfaces:**
- Produces: `Layout.astro` accepts an optional `canonical?: string` prop. When provided, it's used verbatim in `<link rel="canonical">` and `<meta property="og:url">`. When absent, behavior is unchanged (auto-derives from `Astro.url.pathname` + `Astro.site`). Task 4 depends on this.

- [ ] **Step 1: Update the `Props` interface and the canonical derivation**

Replace the current frontmatter (lines 1–15) of `src/layouts/Layout.astro` with:

```astro
---
import "../styles/global.css";

interface Props {
  title?: string;
  description?: string;
  canonical?: string;
}

const {
  title = "Diego Pilosof · Strategic Finance & FP&A",
  description = "CPA, Big 4 trained, ex-Controller at Compugen (Nasdaq). Building AI workflows for finance and revenue operations.",
  canonical: canonicalOverride,
} = Astro.props;

const canonical = canonicalOverride ?? new URL(Astro.url.pathname, Astro.site).toString();
---
```

Leave lines 16 onward unchanged — they already read from the local `canonical` variable.

- [ ] **Step 2: Verify the home page canonical is still auto-derived**

Run:
```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && npm run build
```
Expected: build succeeds.

Then:
```bash
grep 'rel="canonical"' "/Users/Diego/Desktop/claude code/portfolio web/site/dist/index.html"
```
Expected: `<link rel="canonical" href="https://diegopilosof.com/">` (or whatever the current site URL resolves to).

- [ ] **Step 3: Commit**

```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && \
git add src/layouts/Layout.astro && \
git commit -m "Layout: accept optional canonical prop, keep auto-derive fallback"
```

---

## Task 4: Create the `/notes/[slug]` route

**Files:**
- Create: `src/pages/notes/[slug].astro`
- Temporary (created and deleted within this task): `src/content/writing/2026-08-canary-anchor.md`
- Test: `npm run build`, inspect `dist/notes/canary-anchor/index.html`

**Interfaces:**
- Consumes: `writing` schema with `kind: anchor` and `linkedin_url` (from Task 1); `canonical` prop on `Layout` (from Task 3).
- Produces: static pages at `/notes/[slug]/` for every entry with `kind === "anchor"`. Slug derivation: file id → strip leading `YYYY-MM-` prefix. Task 5 links to these URLs from the home page.

- [ ] **Step 1: Create a temporary anchor fixture for verification**

Write `src/content/writing/2026-08-canary-anchor.md`:

```markdown
---
kind: anchor
title: Canary anchor post
published: 2026-08-16
description: Temporary fixture used only to verify the /notes/[slug] route generates and the canonical link points to LinkedIn.
linkedin_url: https://www.linkedin.com/posts/diegopilosof_canary
---

This is body text used only for verification. It should render as a paragraph inside the reading layout.

A second paragraph, to confirm paragraph spacing works.
```

- [ ] **Step 2: Create `src/pages/notes/[slug].astro`**

Write the full file:

```astro
---
import { getCollection, render, type CollectionEntry } from "astro:content";
import Layout from "../../layouts/Layout.astro";

export async function getStaticPaths() {
  const anchors = await getCollection("writing", (p) => p.data.kind === "anchor");
  return anchors.map((post) => ({
    params: { slug: post.id.replace(/^\d{4}-\d{2}-/, "") },
    props: { post },
  }));
}

type Props = { post: CollectionEntry<"writing"> };

const { post } = Astro.props;
const { Content } = await render(post);

const linkedinUrl = post.data.linkedin_url;
if (!linkedinUrl) {
  throw new Error(`Anchor post "${post.id}" is missing required linkedin_url.`);
}

const fmt = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const pageTitle = `${post.data.title} · Diego Pilosof`;
---
<Layout title={pageTitle} description={post.data.description} canonical={linkedinUrl}>
  <main id="main" class="px-6 md:px-12 py-16 md:py-24 max-w-2xl mx-auto">
    <a href="/#inputs" class="font-mono text-xs uppercase tracking-[0.2em] text-text-muted hover:text-accent transition-colors">
      ← Back to diegopilosof.com
    </a>

    <header class="mt-8 mb-10">
      <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-text-light mb-3">
        {post.data.title}
      </h1>
      <time datetime={post.data.published.toISOString()} class="font-mono text-xs text-text-muted">
        {fmt(post.data.published)}
      </time>
    </header>

    <article class="note-body">
      <Content />
    </article>

    <footer class="mt-12 pt-6 border-t border-white/[0.08]">
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 font-mono text-sm text-accent hover:text-accent-2 transition-colors"
      >
        Originally posted on LinkedIn
        <span>↗</span>
      </a>
    </footer>
  </main>
</Layout>

<style>
  .note-body {
    color: var(--color-text-dim);
    font-size: 1.0625rem;
    line-height: 1.75;
  }
  .note-body :global(p) {
    margin-bottom: 1.25em;
  }
  .note-body :global(p:last-child) {
    margin-bottom: 0;
  }
  .note-body :global(strong) {
    color: var(--color-text-light);
    font-weight: 600;
  }
  .note-body :global(em) {
    color: var(--color-text-light);
    font-style: italic;
  }
  .note-body :global(a) {
    color: var(--color-accent);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }
  .note-body :global(a:hover) {
    color: var(--color-accent-2);
  }
  .note-body :global(blockquote) {
    border-left: 2px solid var(--color-accent);
    padding-left: 1rem;
    margin: 1.5em 0;
    color: var(--color-text-muted);
    font-style: italic;
  }
  .note-body :global(code) {
    font-family: var(--font-mono);
    font-size: 0.9em;
    background: rgba(140, 165, 195, 0.12);
    padding: 0.15em 0.35em;
    border-radius: 3px;
  }
  .note-body :global(ul),
  .note-body :global(ol) {
    margin: 1em 0 1.25em 1.5em;
  }
  .note-body :global(li) {
    margin-bottom: 0.5em;
  }
</style>
```

- [ ] **Step 3: Run the build and verify the page**

Run:
```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && npm run build
```
Expected: build succeeds. Log should mention generating a page at `/notes/canary-anchor/`.

Inspect:
```bash
grep -E 'rel="canonical"|Originally posted on LinkedIn|Canary anchor post' "/Users/Diego/Desktop/claude code/portfolio web/site/dist/notes/canary-anchor/index.html"
```
Expected: three matches — the canonical tag pointing to the LinkedIn URL, the "Originally posted on LinkedIn" footer, and the page title. The canonical `href` must be `https://www.linkedin.com/posts/diegopilosof_canary`, NOT the site URL.

- [ ] **Step 4: Delete the temporary fixture and re-verify empty-set behavior**

Run:
```bash
rm "/Users/Diego/Desktop/claude code/portfolio web/site/src/content/writing/2026-08-canary-anchor.md" && \
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && npm run build
```
Expected: build succeeds. No page under `dist/notes/` is generated (getStaticPaths returns an empty array — this is fine).

Verify:
```bash
ls "/Users/Diego/Desktop/claude code/portfolio web/site/dist/notes/" 2>&1 || echo "no notes directory — expected"
```

- [ ] **Step 5: Commit**

```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && \
git add src/pages/notes/ && \
git commit -m "Add /notes/[slug] route for anchor posts with canonical to LinkedIn"
```

Note on the commit scope: the fixture file was created and deleted within this task; `git add src/pages/notes/` picks up only the new page file. Confirm with `git status` before committing — nothing under `src/content/writing/` should be staged.

---

## Task 5: Restructure the Inputs left column (anchor + tarjetas)

**Files:**
- Modify: `src/components/Writing.astro` (whole component — full replacement in Step 2 below)
- Temporary (created and deleted within this task): `src/content/writing/2026-08-canary-anchor.md`, `src/content/writing/2026-08-canary-linkedin.md`
- Test: `npm run build`, inspect `dist/index.html`

**Interfaces:**
- Consumes: `writing` schema with `kind: anchor | linkedin | recommended` (Task 1); anchor pages at `/notes/[slug]` (Task 4).
- Produces: the final Inputs section — no downstream consumers.

- [ ] **Step 1: Create two temporary fixtures for verification**

Write `src/content/writing/2026-08-canary-anchor.md`:

```markdown
---
kind: anchor
title: Canary anchor post
published: 2026-08-16
description: Temporary fixture used only to verify the anchor sub-block renders on the home page with an internal link.
linkedin_url: https://www.linkedin.com/posts/diegopilosof_canary
---

Body text.
```

Write `src/content/writing/2026-08-canary-linkedin.md`:

```markdown
---
kind: linkedin
title: Canary linkedin tarjeta
published: 2026-08-15
description: Temporary fixture, not rendered on the home for kind linkedin.
link: https://www.linkedin.com/posts/diegopilosof_canary-tarjeta
---
```

- [ ] **Step 2: Replace `src/components/Writing.astro` with the full new version**

Write the full file:

```astro
---
import { getCollection } from "astro:content";
import SectionHeader from "./SectionHeader.astro";

const all = await getCollection("writing");

const anchors = all
  .filter((p) => p.data.kind === "anchor")
  .sort((a, b) => b.data.published.getTime() - a.data.published.getTime())
  .slice(0, 5);

const linkedin = all
  .filter((p) => p.data.kind === "linkedin")
  .sort((a, b) => b.data.published.getTime() - a.data.published.getTime())
  .slice(0, 3);

const recommended = all
  .filter((p) => p.data.kind === "recommended")
  .sort((a, b) => b.data.published.getTime() - a.data.published.getTime());

const hasAnchors = anchors.length > 0;
const hasLinkedin = linkedin.length > 0;
const hasLeftColumn = hasAnchors || hasLinkedin;
const hasRecommended = recommended.length > 0;
const hasAny = hasLeftColumn || hasRecommended;
const bothColumns = hasLeftColumn && hasRecommended;

const linkedinActivity = "https://www.linkedin.com/in/diegopilosof/recent-activity/all/";
const anchorSlug = (id: string) => id.replace(/^\d{4}-\d{2}-/, "");

const fmt = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
---
{hasAny && (
  <section id="inputs" class="px-6 md:px-12 lg:px-24 py-20 md:py-28 max-w-6xl mx-auto">
    <SectionHeader number="04" title="Inputs" subtitle="What I'm reading and posting" />

    <div class:list={["grid gap-12 md:gap-16", bothColumns && "md:grid-cols-2"]}>
      {hasLeftColumn && (
        <div>
          <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-5">
            Recent on LinkedIn
          </h3>

          {hasAnchors && (
            <ul class="divide-y divide-white/[0.06] mb-8">
              {anchors.map((post) => (
                <li class="py-5 first:pt-0">
                  <a href={`/notes/${anchorSlug(post.id)}`} class="group block">
                    <div class="flex items-baseline justify-between gap-4 mb-1">
                      <h4 class="text-text-light font-semibold text-base group-hover:text-accent transition-colors">
                        {post.data.title}
                      </h4>
                      <time
                        datetime={post.data.published.toISOString()}
                        class="font-mono text-xs text-text-muted shrink-0"
                      >
                        {fmt(post.data.published)}
                      </time>
                    </div>
                    <p class="text-text-muted text-sm leading-relaxed mb-2">{post.data.description}</p>
                    <span class="font-mono text-xs text-accent group-hover:text-accent-2 transition-colors">
                      → Read on site
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {hasLinkedin && (
            <>
              <h4 class="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-4 mt-2">
                Also on LinkedIn
              </h4>
              <ul class="divide-y divide-white/[0.06] mb-6">
                {linkedin.map((post) => {
                  const href = post.data.link ?? linkedinActivity;
                  return (
                    <li class="py-3 first:pt-0">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="group flex items-baseline justify-between gap-4"
                      >
                        <span class="text-text-light text-sm group-hover:text-accent transition-colors">
                          {post.data.title}
                          <span class="text-text-muted ml-1">↗</span>
                        </span>
                        <time
                          datetime={post.data.published.toISOString()}
                          class="font-mono text-xs text-text-muted shrink-0"
                        >
                          {fmt(post.data.published)}
                        </time>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <a
            href={linkedinActivity}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 font-mono text-sm text-accent hover:text-accent-2 transition-colors"
          >
            See all activity on LinkedIn
            <span>↗</span>
          </a>
        </div>
      )}

      {hasRecommended && (
        <div>
          <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-text-muted mb-5">
            Worth reading
          </h3>
          <ul class="divide-y divide-white/[0.06]">
            {recommended.map((post) => (
              <li class="py-5 first:pt-0">
                <a
                  href={post.data.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group block"
                >
                  <div class="flex items-baseline justify-between gap-4 mb-1">
                    <h4 class="text-text-light font-semibold text-base group-hover:text-accent transition-colors">
                      {post.data.title}
                      <span class="text-text-muted ml-1">↗</span>
                    </h4>
                    <time
                      datetime={post.data.published.toISOString()}
                      class="font-mono text-xs text-text-muted shrink-0"
                    >
                      {fmt(post.data.published)}
                    </time>
                  </div>
                  {(post.data.author || post.data.source) && (
                    <p class="font-mono text-xs text-accent/80 mb-1">
                      {[post.data.author, post.data.source].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p class="text-text-muted text-sm leading-relaxed">{post.data.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </section>
)}
```

- [ ] **Step 3: Verify the home page renders both sub-blocks**

Run:
```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && npm run build
```
Expected: build succeeds, generates `dist/notes/canary-anchor/index.html` plus `dist/index.html`.

Inspect the home:
```bash
grep -E 'Canary anchor post|Canary linkedin tarjeta|Also on LinkedIn|Read on site' "/Users/Diego/Desktop/claude code/portfolio web/site/dist/index.html"
```
Expected: four matches — the anchor title, the tarjeta title, the divider label, and the "Read on site" internal-link label.

Also verify the anchor card's `href` is internal:
```bash
grep -oE 'href="/notes/[^"]+"' "/Users/Diego/Desktop/claude code/portfolio web/site/dist/index.html"
```
Expected: `href="/notes/canary-anchor"`.

- [ ] **Step 4: Delete both fixtures and confirm empty-set collapses cleanly**

Run:
```bash
rm "/Users/Diego/Desktop/claude code/portfolio web/site/src/content/writing/2026-08-canary-anchor.md" \
   "/Users/Diego/Desktop/claude code/portfolio web/site/src/content/writing/2026-08-canary-linkedin.md" && \
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && npm run build
```
Expected: build succeeds. With no anchor and no linkedin content, only the "Worth reading" column renders — no two-column layout, no "Recent on LinkedIn" header on the left.

Inspect:
```bash
grep -c 'Recent on LinkedIn' "/Users/Diego/Desktop/claude code/portfolio web/site/dist/index.html"
```
Expected: `0`.

```bash
grep -c 'Worth reading' "/Users/Diego/Desktop/claude code/portfolio web/site/dist/index.html"
```
Expected: `1`.

- [ ] **Step 5: Final `check` + build pass**

```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && npm run check && npm run build
```
Expected: both succeed with no errors.

- [ ] **Step 6: Commit**

Verify with `git status` that no fixture files are staged:
```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && git status --short
```
Expected: only `src/components/Writing.astro` shows as modified.

Then:
```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site" && \
git add src/components/Writing.astro && \
git commit -m "Inputs: anchor sub-block + \"Also on LinkedIn\" tarjetas below"
```

---

## Post-plan verification (manual, once all tasks are green)

1. `npm run dev` and open http://localhost:4321/ — the Inputs section shows only "Worth reading" (no anchor content yet). No JS console errors.
2. Add one real anchor post via `docs/content-templates/writing-anchor.md` (copy → paste → fill), and confirm it appears on the home with `→ Read on site` and its own page at `/notes/[slug]/`.
3. On the `/notes/[slug]/` page, view page source and confirm `<link rel="canonical" href="https://www.linkedin.com/…">` — must NOT be `https://diegopilosof.com/…`.
4. Run Lighthouse mobile on the home page and one `/notes/[slug]` page — both must score >95 on Performance and Accessibility.
5. Delete the test anchor before merging, or leave it as Diego's first real post.
