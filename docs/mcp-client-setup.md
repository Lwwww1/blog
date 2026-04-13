# MCP Client Setup

After publishing your package, you can configure MCP clients to use it.

## 1) Codex desktop example

Use your MCP config file to run:

```json
{
  "mcpServers": {
    "blog-content": {
      "command": "npx",
      "args": ["-y", "blog-mcp-server-template", "--site", "https://blog.example.com"]
    }
  }
}
```

## 2) Claude desktop style example

```json
{
  "mcpServers": {
    "blog-content": {
      "command": "npx",
      "args": ["-y", "blog-mcp-server-template", "--site", "https://blog.example.com"],
      "env": {
        "BLOG_MCP_TIMEOUT_MS": "15000"
      }
    }
  }
}
```

## 3) Recommended runtime env

- `BLOG_MCP_SITE_URL`: deployed site domain
- `BLOG_MCP_BASE_PATH`: optional base path if not root
- `BLOG_MCP_TIMEOUT_MS`: request timeout in milliseconds
