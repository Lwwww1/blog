import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "posts");
const allowedExtensions = new Set([".md", ".mdx"]);

if (!fs.existsSync(postsDirectory)) {
  console.error("Missing content/posts directory.");
  process.exit(1);
}

const files = fs
  .readdirSync(postsDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((fileName) => allowedExtensions.has(path.extname(fileName)));

if (files.length === 0) {
  console.error("No markdown files found in content/posts.");
  process.exit(1);
}

const slugSet = new Set();
const errors = [];

const normalizeTags = (input) => {
  if (!input) {
    return [];
  }
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(input)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

for (const fileName of files) {
  const slug = fileName.replace(/\.(md|mdx)$/i, "");
  const filePath = path.join(postsDirectory, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const parsed = matter(source);
  const frontMatter = parsed.data ?? {};

  if (slugSet.has(slug)) {
    errors.push(`${fileName}: duplicate slug '${slug}'`);
  }
  slugSet.add(slug);

  const title = String(frontMatter.title ?? "").trim();
  if (!title) {
    errors.push(`${fileName}: missing frontmatter 'title'`);
  }

  const dateRaw = String(frontMatter.date ?? "").trim();
  if (!dateRaw) {
    errors.push(`${fileName}: missing frontmatter 'date'`);
  } else if (Number.isNaN(new Date(dateRaw).getTime())) {
    errors.push(`${fileName}: invalid date '${dateRaw}'`);
  }

  const summary = String(frontMatter.summary ?? "").trim();
  if (!summary) {
    errors.push(`${fileName}: missing frontmatter 'summary'`);
  }

  const tags = normalizeTags(frontMatter.tags);
  if (tags.length === 0) {
    errors.push(`${fileName}: missing frontmatter 'tags'`);
  }

  const published = frontMatter.published;
  if (
    published !== undefined &&
    typeof published !== "boolean" &&
    published !== "true" &&
    published !== "false"
  ) {
    errors.push(`${fileName}: 'published' must be boolean if provided`);
  }
}

if (errors.length > 0) {
  console.error("Post validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${files.length} post(s) successfully.`);
