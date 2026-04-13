import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");
const PUBLIC_DIRECTORY = path.join(process.cwd(), "public");
const MCP_DIRECTORY = path.join(PUBLIC_DIRECTORY, "mcp");
const ARTICLES_DIRECTORY = path.join(MCP_DIRECTORY, "articles");
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(
  /\/+$/,
  "",
);
const generatedAt = new Date().toISOString();

const stripMarkdown = (raw) =>
  raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const estimateReadingMinutes = (content) => {
  const words = stripMarkdown(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const normalizeTags = (input) => {
  if (!input) {
    return [];
  }
  const tags = Array.isArray(input)
    ? input
    : String(input)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  return Array.from(new Set(tags.map((tag) => tag.toLowerCase())));
};

const buildSummary = (frontMatterSummary, content) => {
  if (typeof frontMatterSummary === "string" && frontMatterSummary.trim()) {
    return frontMatterSummary.trim();
  }
  const stripped = stripMarkdown(content);
  if (stripped.length <= 160) {
    return stripped;
  }
  return `${stripped.slice(0, 157)}...`;
};

const loadPosts = () => {
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    return [];
  }

  const files = fs
    .readdirSync(POSTS_DIRECTORY, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => MARKDOWN_EXTENSIONS.has(path.extname(fileName)));

  return files
    .map((fileName) => {
      const slug = fileName.replace(/\.(md|mdx)$/i, "");
      const filePath = path.join(POSTS_DIRECTORY, fileName);
      const source = fs.readFileSync(filePath, "utf8");
      const parsed = matter(source);
      const stat = fs.statSync(filePath);
      const metadata = parsed.data ?? {};

      const date = metadata.date ? new Date(String(metadata.date)) : stat.mtime;
      const normalizedDate = Number.isNaN(date.getTime())
        ? stat.mtime.toISOString()
        : date.toISOString();
      const title = String(metadata.title || slug);
      const tags = normalizeTags(metadata.tags);
      const summary = buildSummary(metadata.summary, parsed.content);
      const readingMinutes = estimateReadingMinutes(parsed.content);
      const published =
        typeof metadata.published === "boolean" ? metadata.published : true;

      return {
        slug,
        title,
        date: normalizedDate,
        tags,
        summary,
        readingMinutes,
        url: `${siteUrl}/posts/${slug}/`,
        published,
        content: parsed.content.trim(),
      };
    })
    .filter((post) => post.published)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
};

const writeJson = (targetPath, value) => {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, JSON.stringify(value, null, 2));
};

const posts = loadPosts();

fs.mkdirSync(ARTICLES_DIRECTORY, { recursive: true });

const siteInfo = {
  generatedAt,
  title: "LOUO Blog",
  description:
    "Personal blog built with Next.js static export, Pagefind search, Giscus comments, and MCP integration.",
  siteUrl,
  totalPosts: posts.length,
};

const catalog = {
  generatedAt,
  total: posts.length,
  posts: posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    summary: post.summary,
    readingMinutes: post.readingMinutes,
    url: post.url,
    published: post.published,
  })),
};

const latest = {
  generatedAt,
  posts: posts.slice(0, 10).map((post) => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    tags: post.tags,
    summary: post.summary,
    readingMinutes: post.readingMinutes,
    url: post.url,
    published: post.published,
  })),
};

const index = {
  generatedAt,
  site: siteInfo,
  resources: [
    {
      uri: "blog://site/info",
      type: "site-info",
      path: "/mcp/site.json",
      mimeType: "application/json",
    },
    {
      uri: "blog://posts/catalog",
      type: "catalog",
      path: "/mcp/catalog.json",
      mimeType: "application/json",
    },
    {
      uri: "blog://posts/latest",
      type: "latest",
      path: "/mcp/latest.json",
      mimeType: "application/json",
    },
    ...posts.map((post) => ({
      uri: `blog://posts/${post.slug}`,
      type: "article",
      path: `/mcp/articles/${post.slug}.json`,
      mimeType: "application/json",
    })),
  ],
};

writeJson(path.join(MCP_DIRECTORY, "site.json"), siteInfo);
writeJson(path.join(MCP_DIRECTORY, "catalog.json"), catalog);
writeJson(path.join(MCP_DIRECTORY, "latest.json"), latest);
writeJson(path.join(MCP_DIRECTORY, "index.json"), index);

for (const post of posts) {
  writeJson(path.join(ARTICLES_DIRECTORY, `${post.slug}.json`), {
    generatedAt,
    ...post,
  });
}
