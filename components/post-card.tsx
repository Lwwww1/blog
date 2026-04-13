import Link from "next/link";
import type { PostSummary } from "@/lib/posts";
import { formatDate } from "@/lib/format";

type PostCardProps = {
  post: PostSummary;
};

export const PostCard = ({ post }: PostCardProps) => (
  <article className="post-card">
    <h3>
      <Link href={`/posts/${post.slug}`}>{post.title}</Link>
    </h3>
    <p className="post-meta">
      {formatDate(post.date)} · {post.readingMinutes} min read
    </p>
    <p className="post-summary">{post.summary}</p>
    <div className="tag-row">
      {post.tags.map((tag) => (
        <Link key={tag} className="tag-chip" href={`/tags/${encodeURIComponent(tag)}`}>
          #{tag}
        </Link>
      ))}
    </div>
  </article>
);
