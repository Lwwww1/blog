import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { GiscusComments } from "@/components/giscus-comments";
import { formatDate } from "@/lib/format";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const generateStaticParams = () =>
  getAllPostSlugs().map((slug) => ({ slug }));

export const generateMetadata = async ({
  params,
}: PostPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }
  return {
    title: post.title,
    description: post.summary,
  };
};

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <article className="page-block" data-pagefind-body>
      <header className="article-header">
        <h1 data-pagefind-meta="title">{post.title}</h1>
        <p className="post-meta">
          {formatDate(post.date)} · {post.readingMinutes} min read
        </p>
        {post.tags.length > 0 ? (
          <div className="tag-row">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                className="tag-chip"
                href={`/tags/${encodeURIComponent(tag)}`}
                data-pagefind-meta="tag"
              >
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <div className="markdown">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <section className="comments-wrap">
        <h2>Comments</h2>
        <GiscusComments />
      </section>
    </article>
  );
}
