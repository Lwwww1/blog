import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Posts",
  description: "All blog posts.",
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <>
      <header className="list-page-header">
        <h1>All Posts</h1>
        <p>Static pages generated from content/posts Markdown files.</p>
      </header>
      {posts.length === 0 ? (
        <p className="empty-state">
          No posts found. Add a Markdown file in content/posts.
        </p>
      ) : (
        <section className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </section>
      )}
    </>
  );
}
