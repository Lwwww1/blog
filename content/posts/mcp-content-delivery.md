---
title: MCP For Content Delivery
date: 2026-04-12
tags: [mcp, automation, content]
summary: Expose your blog metadata and article content as MCP resources for AI tooling.
published: true
---

This blog ships with pre-generated JSON resources under `public/mcp`:

- `index.json` for resource discovery.
- `catalog.json` for all post metadata.
- `latest.json` for recent updates.
- `articles/{slug}.json` for full article payloads.

These files can be consumed by a dedicated MCP server package so any MCP client
can search or read your blog data without scraping HTML.

## Why this is useful

- AI clients get stable, typed content inputs.
- Publishing updates automatically refreshes MCP data.
- You keep one source of truth for both human readers and AI agents.
