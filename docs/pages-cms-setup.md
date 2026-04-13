# Pages CMS Setup (No Self-Hosted Backend)

This project includes a ready-to-use `.pages.yml` config for visual content editing.

## 1) Connect repository

1. Open [https://pagescms.org/](https://pagescms.org/).
2. Sign in with GitHub.
3. Select repository `Lwwww1/blog`.
4. Choose branch `main`.

## 2) Create or edit posts

1. Open collection `Posts`.
2. Click `New` to create an article.
3. Fill in `title`, `date`, `tags`, `summary`, `published`.
4. Write content in `Body`.
5. Save to commit directly to GitHub.

Saved files are stored in `content/posts/*.md`, so your existing Next.js build pipeline remains unchanged.

## 3) Publish flow

1. Pages CMS commits content to `main`.
2. GitHub Actions workflow runs automatically.
3. GitHub Pages publishes the updated static site.
