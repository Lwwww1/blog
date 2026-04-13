import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");
const MARKDOWN_EXTENSIONS = new Set([".md", ".mdx"]);

type FrontMatter = {
  title?: string;
  date?: string;
  tags?: string[] | string;
  summary?: string;
  cover?: string;
  published?: boolean;
};

export type PostSummary = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  cover?: string;
  readingMinutes: number;
  published: boolean;
};

export type Post = PostSummary & {
  content: string;
};

type TagStat = {
  name: string;
  count: number;
};

let cachedPosts: Post[] | null = null;

const sanitizeTags = (input: FrontMatter["tags"]): string[] => {
  if (!input) {
    return [];
  }

  const rawTags = Array.isArray(input)
    ? input
    : input
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const uniqueTags = new Set(
    rawTags
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.toLowerCase()),
  );

  return Array.from(uniqueTags);
};

const stripMarkdown = (raw: string): string =>
  raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const estimateReadingMinutes = (content: string): number => {
  const words = stripMarkdown(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const createSummary = (frontMatterSummary: unknown, content: string): string => {
  if (typeof frontMatterSummary === "string" && frontMatterSummary.trim()) {
    return frontMatterSummary.trim();
  }

  const stripped = stripMarkdown(content);
  if (stripped.length <= 160) {
    return stripped;
  }
  return `${stripped.slice(0, 157)}...`;
};

const normalizeDate = (dateValue: FrontMatter["date"], fallback: Date): string => {
  if (!dateValue) {
    return fallback.toISOString();
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return fallback.toISOString();
  }
  return date.toISOString();
};

const loadPosts = (): Post[] => {
  if (cachedPosts) {
    return cachedPosts;
  }

  if (!fs.existsSync(POSTS_DIRECTORY)) {
    cachedPosts = [];
    return cachedPosts;
  }

  const files = fs
    .readdirSync(POSTS_DIRECTORY, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => MARKDOWN_EXTENSIONS.has(path.extname(fileName)));

  const posts = files
    .map((fileName) => {
      const slug = fileName.replace(/\.(md|mdx)$/i, "");
      const filePath = path.join(POSTS_DIRECTORY, fileName);
      const source = fs.readFileSync(filePath, "utf8");
      const parsed = matter(source);
      const frontMatter = parsed.data as FrontMatter;
      const stat = fs.statSync(filePath);

      const title = frontMatter.title?.trim() || slug;
      const date = normalizeDate(frontMatter.date, stat.mtime);
      const tags = sanitizeTags(frontMatter.tags);
      const summary = createSummary(frontMatter.summary, parsed.content);
      const published =
        typeof frontMatter.published === "boolean" ? frontMatter.published : true;
      const readingMinutes = estimateReadingMinutes(parsed.content);

      return {
        slug,
        title,
        date,
        tags,
        summary,
        cover: frontMatter.cover,
        published,
        readingMinutes,
        content: parsed.content.trim(),
      } satisfies Post;
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  cachedPosts = posts;
  return posts;
};

const toSummary = (post: Post): PostSummary => ({
  slug: post.slug,
  title: post.title,
  date: post.date,
  tags: post.tags,
  summary: post.summary,
  cover: post.cover,
  readingMinutes: post.readingMinutes,
  published: post.published,
});

export const getAllPosts = (): PostSummary[] =>
  loadPosts()
    .filter((post) => post.published)
    .map((post) => toSummary(post));

export const getAllPostSlugs = (): string[] =>
  getAllPosts().map((post) => post.slug);

export const getPostBySlug = (slug: string): Post | null => {
  const post = loadPosts().find((entry) => entry.slug === slug && entry.published);
  return post ?? null;
};

export const getPostsByTag = (tag: string): PostSummary[] => {
  const normalizedTag = tag.trim().toLowerCase();
  return getAllPosts().filter((post) =>
    post.tags.some((item) => item.toLowerCase() === normalizedTag),
  );
};

export const getTagStats = (): TagStat[] => {
  const counter = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(counter.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
};
