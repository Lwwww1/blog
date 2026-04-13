import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "minio";

const parseArgs = (argv) => {
  const args = {
    file: "",
    slug: "shared",
    alt: "image",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--file" && next) {
      args.file = next;
      index += 1;
      continue;
    }
    if (arg === "--slug" && next) {
      args.slug = next;
      index += 1;
      continue;
    }
    if (arg === "--alt" && next) {
      args.alt = next;
      index += 1;
      continue;
    }
  }

  return args;
};

const requiredEnv = [
  "MINIO_ENDPOINT",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_BUCKET",
];

for (const name of requiredEnv) {
  if (!process.env[name]) {
    console.error(`Missing environment variable: ${name}`);
    process.exit(1);
  }
}

const args = parseArgs(process.argv.slice(2));
if (!args.file) {
  console.error(
    "Usage: npm run upload:image -- --file ./path/to/image.png --slug post-slug --alt cover",
  );
  process.exit(1);
}

const endpoint = process.env.MINIO_ENDPOINT;
const port = Number(process.env.MINIO_PORT || "9000");
const useSSL = process.env.MINIO_USE_SSL === "true";
const bucket = process.env.MINIO_BUCKET;
const accessKey = process.env.MINIO_ACCESS_KEY;
const secretKey = process.env.MINIO_SECRET_KEY;
const publicBaseUrl = process.env.MINIO_PUBLIC_BASE_URL?.replace(/\/+$/, "");

const client = new Client({
  endPoint: endpoint,
  port,
  useSSL,
  accessKey,
  secretKey,
});

const safeSegment = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "shared";

const extensionToContentType = (extension) => {
  switch (extension.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
};

const run = async () => {
  const filePath = path.resolve(process.cwd(), args.file);
  const fileBuffer = await fs.readFile(filePath);

  const extension = path.extname(filePath);
  const baseName = path
    .basename(filePath, extension)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const timestamp = new Date()
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "");
  const objectName = `posts/${safeSegment(args.slug)}/${timestamp}-${baseName}${extension.toLowerCase()}`;

  await client.putObject(bucket, objectName, fileBuffer, {
    "Content-Type": extensionToContentType(extension),
  });

  const endpointWithPort =
    (useSSL ? "https://" : "http://") + endpoint + (port ? `:${port}` : "");
  const fileUrl = publicBaseUrl
    ? `${publicBaseUrl}/${objectName}`
    : `${endpointWithPort}/${bucket}/${objectName}`;

  console.log(`Uploaded to: ${fileUrl}`);
  console.log(`Markdown:\n![${args.alt}](${fileUrl})`);
};

run().catch((error) => {
  console.error("Upload failed:", error);
  process.exit(1);
});
