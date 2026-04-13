# blog-mcp-server-template

MCP server that exposes static blog data generated under `/mcp`:

- `blog://site/info`
- `blog://posts/catalog`
- `blog://posts/latest`
- `blog://posts/{slug}`

## Usage

```bash
npx blog-mcp-server-template --site https://your-domain.com
```

Or configure environment variables:

```bash
BLOG_MCP_SITE_URL=https://your-domain.com
BLOG_MCP_BASE_PATH=/optional-base-path
BLOG_MCP_TIMEOUT_MS=15000
```

## Exposed tools

- `read_site_info`
- `list_posts`
- `search_posts`
- `read_post`
