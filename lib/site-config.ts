export const siteConfig = {
  title: "LOUO Blog",
  description:
    "Personal blog built with Next.js static export, Pagefind search, Giscus comments, and MCP integration.",
  author: "Your Name",
  defaultSiteUrl: "https://example.com",
};

export const getSiteUrl = (): string => {
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envSiteUrl) {
    return envSiteUrl.replace(/\/+$/, "");
  }
  return siteConfig.defaultSiteUrl;
};
