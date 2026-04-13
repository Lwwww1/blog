import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getPostsByTag, getTagStats } from "@/lib/posts";

type TagPageProps = {
  params: Promise<{
    tag: string;
  }>;
};

export const generateStaticParams = () =>
  getTagStats().map((tag) => ({ tag: encodeURIComponent(tag.name) }));

export const generateMetadata = async ({
  params,
}: TagPageProps): Promise<Metadata> => {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `Tag: ${decodedTag}`,
    description: `Posts tagged with ${decodedTag}.`,
  };
};

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag).toLowerCase();
  const posts = getPostsByTag(decodedTag);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <>
      <header className="list-page-header">
        <h1>#{decodedTag}</h1>
        <p>{posts.length} post(s) matched this tag.</p>
      </header>
      <section className="post-grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </section>
    </>
  );
}
