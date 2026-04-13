import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { getAllPosts, getTagStats } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 6);
  const tags = getTagStats().slice(0, 12);

  return (
    <>
      <section className="hero">
        <h1>Personal blog starter for Next.js SSG on GitHub Pages</h1>
        <p>
          This stack is optimized for content publishing with static export,
          MinIO image hosting, Pagefind local search, Giscus comments, and an
          MCP-friendly data layer.
        </p>
        <div className="hero-links">
          <Link className="button-link is-primary" href="/posts">
            Read posts
          </Link>
          <Link className="button-link" href="/search">
            Search content
          </Link>
        </div>
      </section>

      <section className="page-block">
        <h2 className="section-title">Latest posts</h2>
        {posts.length === 0 ? (
          <p className="empty-state">
            No posts yet. Add Markdown files to content/posts and run npm run
            build.
          </p>
        ) : (
          <div className="post-grid">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="page-block">
        <h2 className="section-title">Popular tags</h2>
        {tags.length === 0 ? (
          <p className="empty-state">No tags available.</p>
        ) : (
          <div className="tag-row">
            {tags.map((tag) => (
              <Link
                key={tag.name}
                className="tag-chip"
                href={`/tags/${encodeURIComponent(tag.name)}`}
              >
                #{tag.name} ({tag.count})
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
