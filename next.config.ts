import type { NextConfig } from "next";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const explicitBasePath = process.env.PAGES_BASE_PATH;

const trimTrailingSlash = (value: string): string =>
  value.endsWith("/") ? value.slice(0, -1) : value;

let basePath = "";
if (explicitBasePath && explicitBasePath !== "__AUTO__") {
  basePath = explicitBasePath === "/" ? "" : explicitBasePath;
} else if (isGitHubActions && repositoryName) {
  basePath = `/${repositoryName}`;
}

basePath = trimTrailingSlash(basePath);

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
