import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About this blog stack.",
};

export default function AboutPage() {
  return (
    <section className="page-block">
      <h1>About This Blog</h1>
      <p>
        This project uses Next.js static export as the rendering layer and
        GitHub Pages for automated deployment.
      </p>
      <p>
        Images are uploaded to MinIO object storage, search is powered by
        Pagefind, and discussions are handled by Giscus.
      </p>
      <p>
        MCP integration is included to expose your site content as structured
        resources and tools for AI clients.
      </p>
    </section>
  );
}
