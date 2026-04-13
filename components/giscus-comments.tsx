"use client";

import Giscus from "@giscus/react";

const requiredKeys = [
  "NEXT_PUBLIC_GISCUS_REPO",
  "NEXT_PUBLIC_GISCUS_REPO_ID",
  "NEXT_PUBLIC_GISCUS_CATEGORY",
  "NEXT_PUBLIC_GISCUS_CATEGORY_ID",
] as const;

const hasGiscusConfig = requiredKeys.every((key) => process.env[key]);

export const GiscusComments = () => {
  if (!hasGiscusConfig) {
    return (
      <p className="comment-disabled">
        Giscus is disabled. Set NEXT_PUBLIC_GISCUS_* variables to enable comments.
      </p>
    );
  }

  return (
    <Giscus
      id="comments"
      repo={process.env.NEXT_PUBLIC_GISCUS_REPO as `${string}/${string}`}
      repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID as string}
      category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY as string}
      categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID as string}
      mapping="pathname"
      strict="1"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="light"
      lang="zh-CN"
      loading="lazy"
    />
  );
};
