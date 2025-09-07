<div align="center">

![Human In The Loop MCP](assets/logo.png)

# Human-In-The-Loop MCP

</div>

## ⚡️ Quick start

Give your AI a human touch. Sometimes machines need to ask for help.

## What is this?

A Model Context Protocol (MCP) server that enables human oversight for AI assistants through Discord or HTTP. When your AI needs clarification or approval, it can reach out to you directly.

## 🛠️ Installation

### Requirements

- Node.js >= v20.0.0 or Bun >= 1.2.20
- Discord Bot Token or HTTP endpoint
- An MCP Client (Claude Desktop, Cursor, VSCode, etc.)

### Cursor

Add to your Cursor settings:

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "human-in-the-loop-mcp",
        "discord",
        "--token", "YOUR_DISCORD_BOT_TOKEN",
        "--user-id", "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "human-in-the-loop-mcp",
        "discord",
        "--token", "YOUR_DISCORD_BOT_TOKEN",
        "--user-id", "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

### VS Code

Add to your VS Code MCP settings:

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "human-in-the-loop-mcp",
        "http",
        "--url", "https://your-endpoint.com/questions"
      ]
    }
  }
}
```

### Using bunx (Recommended)

Quick start with bunx:

```bash
bunx human-in-the-loop-mcp discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
```

### Using npx

```bash
npx human-in-the-loop-mcp discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
```

### Using npm

Global installation:

```bash
npm install -g human-in-the-loop-mcp
human-in-the-loop-mcp discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
```

### Using yarn

```bash
yarn global add human-in-the-loop-mcp
human-in-the-loop-mcp discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
```

### Using pnpm

```bash
pnpm add -g human-in-the-loop-mcp
human-in-the-loop-mcp discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
```

### Using Bun

```bash
bun add -g human-in-the-loop-mcp
bunx human-in-the-loop-mcp discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
```

### Using Deno

```bash
deno run -A npm:human-in-the-loop-mcp discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
```

### From source

Build from source:

```bash
git clone https://github.com/AndyRightNow/human-in-the-loop-mcp.git
cd human-in-the-loop-mcp
bun install
bun run build
bun start discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
```

## Usage

### Discord Transport

Connect your AI to Discord for real-time human feedback:

```bash
bunx human-in-the-loop-mcp discord \
  --token YOUR_DISCORD_BOT_TOKEN \
  --user-id YOUR_DISCORD_USER_ID
```

Run `bunx human-in-the-loop-mcp discord --help` to see all available options.

### HTTP Transport

Integrate with your own HTTP endpoint:

```bash
bunx human-in-the-loop-mcp http \
  --url https://your-endpoint.com/questions
```

Run `bunx human-in-the-loop-mcp http --help` to see all available options.

### Telegram Transport

Under development

### Slack Transport

Under development

### `stdio` Transport

Under development

## How It Works

1. Your AI encounters a decision point requiring human input
2. It uses the `AskQuestion` tool to request guidance
3. You receive a notification through your chosen transport (Discord DM or HTTP webhook)
4. You provide your response
5. The AI continues with your feedback
6. The process repeats as needed

## API

### HTTP Endpoint Requirements

Your endpoint must accept POST requests with this payload:

```typescript
{
  questions: string  // Questions from the AI
}
```

Expected response:

```typescript
{
  answers: string  // Your response
}
```

Status codes:
- 200: Success
- 4xx: Client error
- 5xx: Server error

## Examples

### Discord Setup

1. Create a Discord bot and get its token
2. Get your Discord user ID
3. Run the command with your credentials
4. The bot will DM you when the AI needs input

### HTTP Webhook

Simple Express.js endpoint example:

```javascript
app.post('/questions', (req, res) => {
  console.log('Questions received:', req.body.questions);
  // Implement your response logic
  res.json({ answers: "Your response here" });
});
```

## Troubleshooting

**Q: The bot isn't sending me messages**
A: Ensure you have DMs enabled from server members in your Discord privacy settings.

**Q: Timeout errors**
A: Increase the timeout value with the `--timeout` flag (in milliseconds).

**Q: HTTP endpoint not working**
A: Verify your endpoint URL, check any required headers, and ensure the endpoint is accessible.

## Contributing

Bug reports and feature requests are welcome. Please open an issue on GitHub.

## License

MIT
