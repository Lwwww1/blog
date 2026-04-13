# Personal Blog Stack (Next.js SSG + GitHub Pages)

This repository is a complete static blog stack with:

- Next.js App Router static export (`output: "export"`)
- GitHub Actions deployment to GitHub Pages
- Custom domain support
- Pages CMS visual editor (no self-hosted backend)
- MinIO image upload helper
- Pagefind full-text search
- Giscus comments
- MCP data export and MCP server package

## 1) Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 2) Content workflow

You can publish in two ways:

1. Visual editing with Pages CMS (recommended): use [pagescms.org](https://pagescms.org/) and connect this repository.
2. Local Markdown editing: write posts in `content/posts/*.md`.

Markdown frontmatter format:

```md
---
title: Post title
date: 2026-04-13
tags: [nextjs, pagefind]
summary: One-line summary
published: true
---
```

Pages CMS config is stored in `.pages.yml` at repository root.
Detailed setup: `docs/pages-cms-setup.md`.

## 3) Build pipeline

`npm run build` runs the full static pipeline:

1. `scripts/generate-site-data.mjs` writes JSON resources to `public/mcp`
2. `next build` exports static files to `out`
3. `pagefind --site out --output-subdir pagefind` builds search index
4. `scripts/ensure-cname.mjs` writes `out/CNAME` if `CUSTOM_DOMAIN` exists

## 4) GitHub Pages deployment

Workflow file: `.github/workflows/deploy.yml`

Required repo settings:

1. In `Settings > Pages`, set source to `GitHub Actions`.
2. In `Settings > Variables`, configure:
3. `NEXT_PUBLIC_SITE_URL` (for canonical URLs and MCP payload)
4. `CUSTOM_DOMAIN` (optional, e.g. `blog.example.com`)
5. `PAGES_BASE_PATH`:
6. Use `__AUTO__` for project page default path (`/<repo>`).
7. Use `/` for custom domain root.
8. `NEXT_PUBLIC_GISCUS_REPO`
9. `NEXT_PUBLIC_GISCUS_REPO_ID`
10. `NEXT_PUBLIC_GISCUS_CATEGORY`
11. `NEXT_PUBLIC_GISCUS_CATEGORY_ID`

## 5) MinIO image upload

Set MinIO env vars from `.env.example`, then upload:

```bash
npm run upload:image -- --file ./assets/cover.png --slug welcome-to-your-blog --alt cover
```

The script prints:

- Uploaded URL
- Ready-to-paste Markdown image syntax

Optional MinIO setup commands:

```bash
mc alias set local http://127.0.0.1:9000 minioadmin minioadmin
mc mb local/blog-images
mc anonymous set download local/blog-images
mc cors set local/blog-images ./docs/minio-cors.json
```

## 6) Pagefind search

Search UI route: `/search`

Pagefind index is generated from static output during `postbuild`:

```bash
pagefind --site out --output-subdir pagefind
```

## 7) Giscus comments

Comments render on each post page when all `NEXT_PUBLIC_GISCUS_*` variables are set.

Recommended mapping:

- `mapping=pathname`
- dedicated discussion category `Comments`

## 8) MCP integration

### Static resources generated at build time

- `/mcp/site.json`
- `/mcp/catalog.json`
- `/mcp/latest.json`
- `/mcp/index.json`
- `/mcp/articles/{slug}.json`

### Local MCP server package

Server source: `packages/blog-mcp/index.mjs`

Run locally:

```bash
npm run mcp:serve
```

or

```bash
node packages/blog-mcp/index.mjs --site https://your-domain.com
```

Exposed tools:

- `read_site_info`
- `list_posts`
- `search_posts`
- `read_post`

### Publishing MCP package

Workflow file: `.github/workflows/publish-mcp.yml`

Trigger options:

- manual `workflow_dispatch`
- git tag `mcp-v*`

Before publishing, update `packages/blog-mcp/package.json` package name to your own npm namespace if needed.

Client setup reference:

- `docs/mcp-client-setup.md`

## 9) Validation checklist

Run before pushing:

```bash
npm run typecheck
npm run lint
npm run build
```
