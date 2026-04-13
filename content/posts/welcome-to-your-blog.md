---
title: Welcome To Your New Blog Stack
date: 2026-04-13
tags: [nextjs, github-pages, vibe-coding]
summary: A baseline post to verify static generation, tagging, search, and comments.
published: true
---

This post exists to confirm the end-to-end pipeline:

- Markdown source lives in `content/posts`.
- Next.js app router renders each post as static HTML.
- Pagefind indexes generated pages after build.
- Giscus can attach comments by pathname.

## Suggested authoring flow

1. Draft in Markdown locally.
2. Add frontmatter title/date/tags/summary.
3. Run `npm run dev` for preview.
4. Push to `main` and let GitHub Actions deploy.

If this post appears on the home page and in search, your baseline is working.
