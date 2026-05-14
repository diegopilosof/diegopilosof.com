# diegopilosof.com — portfolio site

Personal portfolio for Diego Pilosof. Strategic Finance and FP&A.
Built per `Portfolio_Web_Brief.md` (one page, restrained, mobile-first).

## Stack

- Astro 5 with content collections for `now`, `projects`, `writing`
- Tailwind CSS 4 (via `@tailwindcss/vite`), brand tokens defined in `src/styles/global.css`
- Inter and JetBrains Mono from Google Fonts
- Deploys static, zero JS by default

## Local development

Prerequisite: Node 20 or 22 LTS. Install from https://nodejs.org/en/download (the macOS .pkg installer).

```bash
cd "/Users/Diego/Desktop/claude code/portfolio web/site"
npm install
npm run dev
```

Dev server runs on http://localhost:4321.

Other scripts:
```bash
npm run build      # build static site to ./dist
npm run preview    # serve the built site locally
npm run check      # type check
```

## Editing content

All content lives in `src/content/`. Edit a markdown file, save, the dev server hot-reloads.

| What to update                  | File                                                  |
| ------------------------------- | ----------------------------------------------------- |
| The "Now" section (every 4 to 6 weeks) | Add a new file under `src/content/now/YYYY-MM.md`. The most recent `updated:` date wins. |
| A project card                  | `src/content/projects/*.md`                           |
| A Medium post you wrote         | Copy `docs/content-templates/published.md` to `src/content/writing/your-slug.md`, fill it in. Section auto-shows when any entry exists. |
| A recommended article            | Copy `docs/content-templates/recommended.md` to `src/content/writing/some-slug.md`, fill it in. |
| Hero copy                       | `src/components/Hero.astro`                           |
| About copy                      | `src/components/About.astro`                          |
| Experience cards                | `src/components/Experience.astro`                     |
| CV file                         | Replace `public/cv/Diego_Pilosof_CV.pdf`              |

The SaaS Financial Dashboard is embedded via an iframe pointing at `public/projects/saas-financial-dashboard/index.html`. Replace that file when the dashboard updates.

### Content collection schemas

Defined in `src/content.config.ts`. Frontmatter is type-checked. If you add a field, update the schema first or `npm run check` will complain.

## Deploy to Vercel

1. Push this repo to GitHub (private or public, your call).
2. Go to https://vercel.com, sign in with GitHub, click "Add New Project".
3. Pick the repo. Vercel auto-detects Astro. Click Deploy.
4. The first deploy gives you a `*.vercel.app` URL. Verify it works.

### Custom domain (diegopilosof.com)

1. **Buy the domain.** Recommended registrars (in order):
   - **Cloudflare Registrar** (cloudflare.com/products/registrar): cheapest renewals, no upsell. Requires a free Cloudflare account first.
   - **Namecheap**: easy UI, decent prices.
   - **Porkbun**: also good, lower prices than Namecheap.
   - Avoid GoDaddy. Higher prices, aggressive upsells.

   Search `diegopilosof.com` on the registrar. If taken, fall back to `diegopilosof.me` or `pilosof.com`.

2. **Connect the domain to Vercel.**
   - In Vercel project → Settings → Domains → Add `diegopilosof.com` and `www.diegopilosof.com`.
   - Vercel will show DNS records you need to add at the registrar.
   - Add the records (A record for the apex, CNAME for `www`).
   - Wait 5 to 30 minutes for DNS to propagate. Vercel auto-issues a free TLS cert.

3. **Verify.**
   - Visit `https://diegopilosof.com`. Should serve the site over HTTPS.

## Lighthouse target

Phase 1 success criterion is mobile Lighthouse >95 in all four categories. Run after deploy:

```bash
npx lighthouse https://diegopilosof.com --view --form-factor=mobile
```

If a category drops below 95, the most likely culprits are unoptimized images or third-party scripts. The site ships zero third-party JS by default. Keep it that way.

## Analytics (optional, when ready)

Two privacy-first options. Both work without cookie banners.

- **Vercel Analytics**: enable in Vercel project Settings → Analytics. One click, zero config.
- **Plausible**: self-hosted or paid. Add the script tag to `src/layouts/Layout.astro` only after Phase 1 is shipped.

Do not add Google Analytics. It hurts load time and signals the wrong things to a finance audience.

## Project structure

```
site/
├── public/                          static assets served as-is
│   ├── cv/Diego_Pilosof_CV.pdf
│   ├── favicon.svg
│   ├── projects/saas-financial-dashboard/index.html  embedded dashboard
│   └── robots.txt
├── src/
│   ├── components/                  one .astro file per UI block
│   ├── content/
│   │   ├── now/                     "Now" entries, latest by updated date wins
│   │   ├── projects/                project cards
│   │   └── writing/                 writing entries (section hides if empty)
│   ├── content.config.ts            content collection schemas
│   ├── layouts/Layout.astro         HTML shell, head, fonts
│   ├── pages/index.astro            single page that composes the sections
│   └── styles/global.css            Tailwind import, brand tokens, print stylesheet
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Brand tokens

Defined once in `src/styles/global.css` under `@theme`. Tailwind picks them up automatically:
- `bg-primary`, `bg-secondary` for surfaces
- `text-accent`, `bg-accent` for the lime
- `text-text-light`, `text-text-dim`, `text-text-muted` for the type ramp
- `font-mono` for numbers and labels

The discipline: navy 70% or more of any surface, lime as accent only.

## When in doubt

Reread `Portfolio_Web_Brief.md` (in the identity pack). The brief is the source of truth for scope, voice, and anti-patterns.
