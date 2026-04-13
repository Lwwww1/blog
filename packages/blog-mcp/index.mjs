#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as z from "zod/v4";

const getArgValue = (flag) => {
  const index = process.argv.findIndex((arg) => arg === flag);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
};

const rawSiteUrl =
  getArgValue("--site") || process.env.BLOG_MCP_SITE_URL || "https://example.com";
const siteUrl = rawSiteUrl.replace(/\/+$/, "");

const rawBasePath = process.env.BLOG_MCP_BASE_PATH || "";
const basePath =
  rawBasePath && rawBasePath !== "/"
    ? rawBasePath.replace(/\/+$/, "")
    : "";

const requestTimeoutMs = Number(process.env.BLOG_MCP_TIMEOUT_MS || "15000");

const cache = new Map();

const buildDataUrl = (pathname) => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${siteUrl}${basePath}${normalizedPath}`;
};

const fetchJson = async (pathname, cacheKey = pathname) => {
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(buildDataUrl(pathname), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while reading ${pathname}`);
    }

    const payload = await response.json();
    cache.set(cacheKey, payload);
    return payload;
  } finally {
    clearTimeout(timeout);
  }
};

const toToolResult = (payload) => ({
  content: [
    {
      type: "text",
      text: JSON.stringify(payload, null, 2),
    },
  ],
});

const toToolError = (error) => ({
  isError: true,
  content: [
    {
      type: "text",
      text: `Error: ${error instanceof Error ? error.message : String(error)}`,
    },
  ],
});

const readSite = () => fetchJson("/mcp/site.json", "site");
const readCatalog = () => fetchJson("/mcp/catalog.json", "catalog");
const readLatest = () => fetchJson("/mcp/latest.json", "latest");
const readPost = (slug) => fetchJson(`/mcp/articles/${slug}.json`, `post:${slug}`);

const server = new McpServer(
  {
    name: "blog-content-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      logging: {},
    },
  },
);

server.registerResource(
  "site-info",
  "blog://site/info",
  {
    title: "Site Info",
    description: "Basic site metadata for the blog.",
    mimeType: "application/json",
  },
  async () => {
    const payload = await readSite();
    return {
      contents: [
        {
          uri: "blog://site/info",
          mimeType: "application/json",
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  },
);

server.registerResource(
  "posts-catalog",
  "blog://posts/catalog",
  {
    title: "Posts Catalog",
    description: "Complete list of post metadata.",
    mimeType: "application/json",
  },
  async () => {
    const payload = await readCatalog();
    return {
      contents: [
        {
          uri: "blog://posts/catalog",
          mimeType: "application/json",
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  },
);

server.registerResource(
  "posts-latest",
  "blog://posts/latest",
  {
    title: "Latest Posts",
    description: "Recently published posts.",
    mimeType: "application/json",
  },
  async () => {
    const payload = await readLatest();
    return {
      contents: [
        {
          uri: "blog://posts/latest",
          mimeType: "application/json",
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  },
);

const articleTemplate = new ResourceTemplate("blog://posts/{slug}", {
  list: async () => {
    const catalog = await readCatalog();
    return {
      resources: (catalog.posts || []).map((post) => ({
        uri: `blog://posts/${post.slug}`,
        name: post.title,
        description: post.summary,
        mimeType: "application/json",
      })),
    };
  },
  complete: {
    slug: async (value) => {
      const catalog = await readCatalog();
      return (catalog.posts || [])
        .map((post) => String(post.slug))
        .filter((slug) => slug.startsWith(value));
    },
  },
});

server.registerResource(
  "post-article",
  articleTemplate,
  {
    title: "Post Article",
    description: "Article payload by slug.",
    mimeType: "application/json",
  },
  async (uri, variables) => {
    const slug = String(variables.slug || "").trim();
    if (!slug) {
      throw new Error("Missing slug");
    }
    const payload = await readPost(slug);
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "read_site_info",
  {
    description: "Read site metadata.",
  },
  async () => {
    try {
      return toToolResult(await readSite());
    } catch (error) {
      return toToolError(error);
    }
  },
);

server.registerTool(
  "list_posts",
  {
    description: "List posts with optional tag filter and size limit.",
    inputSchema: {
      tag: z.string().optional(),
      limit: z.number().int().min(1).max(200).optional(),
    },
  },
  async ({ tag, limit = 50 }) => {
    try {
      const catalog = await readCatalog();
      const normalizedTag = tag?.trim().toLowerCase();

      let posts = Array.isArray(catalog.posts) ? [...catalog.posts] : [];
      if (normalizedTag) {
        posts = posts.filter((post) =>
          (post.tags || []).some(
            (item) => String(item).toLowerCase() === normalizedTag,
          ),
        );
      }

      return toToolResult({
        total: posts.length,
        posts: posts.slice(0, limit),
      });
    } catch (error) {
      return toToolError(error);
    }
  },
);

server.registerTool(
  "search_posts",
  {
    description: "Search posts by title, summary, or tag.",
    inputSchema: {
      query: z.string().min(1),
      limit: z.number().int().min(1).max(100).optional(),
    },
  },
  async ({ query, limit = 20 }) => {
    try {
      const catalog = await readCatalog();
      const q = query.toLowerCase();
      const matched = (catalog.posts || []).filter((post) => {
        const title = String(post.title || "").toLowerCase();
        const summary = String(post.summary || "").toLowerCase();
        const tags = (post.tags || []).join(" ").toLowerCase();
        return title.includes(q) || summary.includes(q) || tags.includes(q);
      });

      return toToolResult({
        total: matched.length,
        posts: matched.slice(0, limit),
      });
    } catch (error) {
      return toToolError(error);
    }
  },
);

server.registerTool(
  "read_post",
  {
    description: "Read a single post by slug.",
    inputSchema: {
      slug: z.string().min(1),
    },
  },
  async ({ slug }) => {
    try {
      return toToolResult(await readPost(slug));
    } catch (error) {
      return toToolError(error);
    }
  },
);

const run = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
};

run().catch((error) => {
  console.error("MCP server failed:", error);
  process.exit(1);
});
