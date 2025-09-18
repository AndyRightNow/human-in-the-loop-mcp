<div align="center">

![Human In The Loop MCP](assets/logo.png)

# Human-In-The-Loop MCP

</div>

## What is this?

A Model Context Protocol (MCP) server that enables human oversight for AI assistants through Discord or HTTP. When your AI needs clarification or approval, it can reach out to you directly.

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

Connect your AI to Telegram for real-time human feedback:

```bash
bunx human-in-the-loop-mcp telegram \
  --token YOUR_TELEGRAM_BOT_TOKEN \
  --user-id YOUR_TELEGRAM_USER_ID
```

Run `bunx human-in-the-loop-mcp telegram --help` to see all available options.

### Slack Transport

Under development

### `stdio` Transport

Under development

## 🛠️ Installation

### Requirements

- Node.js >= v20.0.0 or Bun >= 1.2.20
- Discord Bot Token or HTTP endpoint
- An MCP Client (Claude Desktop, Cursor, VSCode, etc.)

<details>
<summary><b>Install in Cursor</b></summary>

Go to: `Settings` -> `Cursor Settings` -> `MCP` -> `Add new global MCP server`

Pasting the following configuration into your Cursor `~/.cursor/mcp.json` file is the recommended approach. You may also install in a specific project by creating `.cursor/mcp.json` in your project folder. See [Cursor MCP docs](https://docs.cursor.com/context/model-context-protocol) for more info.

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Claude Code</b></summary>

Run this command. See [Claude Code MCP docs](https://docs.anthropic.com/en/docs/claude-code/mcp) for more info.

```sh
claude mcp add human-in-the-loop -- bunx -y human-in-the-loop-mcp discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
```

</details>

<details>
<summary><b>Install in Windsurf</b></summary>

Add this to your Windsurf MCP config file. See [Windsurf MCP docs](https://docs.windsurf.com/windsurf/cascade/mcp) for more info.

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Install in VS Code</b></summary>

Add this to your VS Code MCP config file. See [VS Code MCP docs](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) for more info.

```json
"mcp": {
  "servers": {
    "human-in-the-loop": {
      "type": "stdio",
      "command": "bunx",
      "args": ["-y", "human-in-the-loop-mcp", "discord", "--token", "YOUR_DISCORD_BOT_TOKEN", "--user-id", "YOUR_DISCORD_USER_ID"]
    }
  }
}
```

</details>

<details>
<summary>
<b>Install in Cline</b>
</summary>

You can easily install Human-In-The-Loop through the [Cline MCP Server Marketplace](https://cline.bot/mcp-marketplace) by following these instructions:

1. Open **Cline**.
2. Click the hamburger menu icon (☰) to enter the **MCP Servers** section.
3. Use the search bar within the **Marketplace** tab to find _Human-In-The-Loop_.
4. Click the **Install** button.

Or you can directly edit MCP servers configuration:

1. Open **Cline**.
2. Click the hamburger menu icon (☰) to enter the **MCP Servers** section.
3. Choose **Local Servers** tab.
4. Click the **Edit Configuration** button.
5. Add human-in-the-loop to `mcpServers`:

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Zed</b></summary>

Add this to your Zed `settings.json`. See [Zed Context Server docs](https://zed.dev/docs/assistant/context-servers) for more info.

```json
{
  "context_servers": {
    "human-in-the-loop": {
      "command": {
        "path": "bunx",
        "args": [
          "-y",
          "human-in-the-loop-mcp",
          "discord",
          "--token",
          "YOUR_DISCORD_BOT_TOKEN",
          "--user-id",
          "YOUR_DISCORD_USER_ID"
        ]
      },
      "settings": {}
    }
  }
}
```

</details>

<details>
<summary><b>Install in Augment Code</b></summary>

To configure Human-In-The-Loop MCP in Augment Code, you can use either the graphical interface or manual configuration.

### **A. Using the Augment Code UI**

1. Click the hamburger menu.
2. Select **Settings**.
3. Navigate to the **Tools** section.
4. Click the **+ Add MCP** button.
5. Enter the following command:

   ```
   bunx -y human-in-the-loop-mcp discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
   ```

6. Name the MCP: **Human-In-The-Loop**.
7. Click the **Add** button.

Once the MCP server is added, you can start using Human-In-The-Loop's features directly within Augment Code.

---

### **B. Manual Configuration**

1. Press Cmd/Ctrl Shift P or go to the hamburger menu in the Augment panel
2. Select Edit Settings
3. Under Advanced, click Edit in settings.json
4. Add the server configuration to the `mcpServers` array in the `augment.advanced` object

```json
"augment.advanced": {
  "mcpServers": [
    {
      "name": "human-in-the-loop",
      "command": "bunx",
      "args": ["-y", "human-in-the-loop-mcp", "discord", "--token", "YOUR_DISCORD_BOT_TOKEN", "--user-id", "YOUR_DISCORD_USER_ID"]
    }
  ]
}
```

Once the MCP server is added, restart your editor. If you receive any errors, check the syntax to make sure closing brackets or commas are not missing.

</details>

<details>
<summary><b>Install in Roo Code</b></summary>

Add this to your Roo Code MCP configuration file. See [Roo Code MCP docs](https://docs.roocode.com/features/mcp/using-mcp-in-roo) for more info.

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Gemini CLI</b></summary>

See [Gemini CLI Configuration](https://google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html) for details.

1.  Open the Gemini CLI settings file. The location is `~/.gemini/settings.json` (where `~` is your home directory).
2.  Add the following to the `mcpServers` object in your `settings.json` file:

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

If the `mcpServers` object does not exist, create it.

</details>

<details>
<summary><b>Install in Claude Desktop</b></summary>

Open Claude Desktop developer settings and edit your `claude_desktop_config.json` file to add the following configuration. See [Claude Desktop MCP docs](https://modelcontextprotocol.io/quickstart/user) for more info.

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Opencode</b></summary>

Add this to your Opencode configuration file. See [Opencode MCP docs](https://opencode.ai/docs/mcp-servers) for more info.

```json
{
  "mcp": {
    "human-in-the-loop": {
      "type": "local",
      "command": [
        "bunx",
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ],
      "enabled": true
    }
  }
}
```

</details>

<details>
<summary><b>Install in OpenAI Codex</b></summary>

See [OpenAI Codex](https://github.com/openai/codex) for more information.

Add the following configuration to your OpenAI Codex MCP server settings:

```toml
[mcp_servers.human-in-the-loop]
args = ["-y", "human-in-the-loop-mcp", "discord", "--token", "YOUR_DISCORD_BOT_TOKEN", "--user-id", "YOUR_DISCORD_USER_ID"]
command = "bunx"
```

</details>

<details>
<summary><b>Install in JetBrains AI Assistant</b></summary>

See [JetBrains AI Assistant Documentation](https://www.jetbrains.com/help/ai-assistant/configure-an-mcp-server.html) for more details.

1. In JetBrains IDEs, go to `Settings` -> `Tools` -> `AI Assistant` -> `Model Context Protocol (MCP)`
2. Click `+ Add`.
3. Click on `Command` in the top-left corner of the dialog and select the As JSON option from the list
4. Add this configuration and click `OK`

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

5. Click `Apply` to save changes.
6. The same way human-in-the-loop could be added for JetBrains Junie in `Settings` -> `Tools` -> `Junie` -> `MCP Settings`

</details>

<details>

<summary><b>Install in Kiro</b></summary>

See [Kiro Model Context Protocol Documentation](https://kiro.dev/docs/mcp/configuration/) for details.

1. Navigate `Kiro` > `MCP Servers`
2. Add a new MCP server by clicking the `+ Add` button.
3. Paste the configuration given below:

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ],
      "env": {},
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

4. Click `Save` to apply the changes.

</details>

<details>
<summary><b>Install in Trae</b></summary>

Use the Add manually feature and fill in the JSON configuration information for that MCP server.
For more details, visit the [Trae documentation](https://docs.trae.ai/ide/model-context-protocol?_lang=en).

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Using Bun or Deno</b></summary>

Use these alternatives to run the local Human-In-The-Loop MCP server with other runtimes. These examples work for any client that supports launching a local MCP server via command + args.

#### Bun

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

#### Deno

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "deno",
      "args": [
        "run",
        "--allow-env=NO_DEPRECATION,TRACE_DEPRECATION",
        "--allow-net",
        "npm:human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Install Using the Desktop Extension</b></summary>

Install the `human-in-the-loop.dxt` file from the dxt folder and add it to your client. For more information, please check out [the desktop extensions docs](https://github.com/anthropics/dxt#desktop-extensions-dxt).

</details>

<details>
<summary><b>Install in Windows</b></summary>

The configuration on Windows is slightly different compared to Linux or macOS (_`Cline` is used in the example_). The same principle applies to other editors; refer to the configuration of `command` and `args`.

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "cmd",
      "args": [
        "/c",
        "bunx",
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

</details>

<details>
<summary><b>Install in Amazon Q Developer CLI</b></summary>

Add this to your Amazon Q Developer CLI configuration file. See [Amazon Q Developer CLI docs](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/command-line-mcp-configuration.html) for more details.

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Warp</b></summary>

See [Warp Model Context Protocol Documentation](https://docs.warp.dev/knowledge-and-collaboration/mcp#adding-an-mcp-server) for details.

1. Navigate `Settings` > `AI` > `Manage MCP servers`.
2. Add a new MCP server by clicking the `+ Add` button.
3. Paste the configuration given below:

```json
{
  "human-in-the-loop": {
    "command": "bunx",
    "args": [
      "-y",
      "human-in-the-loop-mcp",
      "discord",
      "--token",
      "YOUR_DISCORD_BOT_TOKEN",
      "--user-id",
      "YOUR_DISCORD_USER_ID"
    ],
    "env": {},
    "working_directory": null,
    "start_on_launch": true
  }
}
```

4. Click `Save` to apply the changes.

</details>

<details>

<summary><b>Install in Copilot Coding Agent</b></summary>

## Using Human-In-The-Loop with Copilot Coding Agent

Add the following configuration to the `mcp` section of your Copilot Coding Agent configuration file Repository->Settings->Copilot->Coding agent->MCP configuration:

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "type": "stdio",
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ],
      "tools": ["AskQuestion"]
    }
  }
}
```

For more information, see the [official GitHub documentation](https://docs.github.com/en/enterprise-cloud@latest/copilot/how-tos/agents/copilot-coding-agent/extending-copilot-coding-agent-with-mcp).

</details>

<details>
<summary><b>Install in LM Studio</b></summary>

See [LM Studio MCP Support](https://lmstudio.ai/blog/lmstudio-v0.3.17) for more information.

#### Manual set-up:

1. Navigate to `Program` (right side) > `Install` > `Edit mcp.json`.
2. Paste the configuration given below:

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

3. Click `Save` to apply the changes.
4. Toggle the MCP server on/off from the right hand side, under `Program`, or by clicking the plug icon at the bottom of the chat box.

</details>

<details>
<summary><b>Install in Visual Studio 2022</b></summary>

You can configure Human-In-The-Loop MCP in Visual Studio 2022 by following the [Visual Studio MCP Servers documentation](https://learn.microsoft.com/visualstudio/ide/mcp-servers?view=vs-2022).

Add this to your Visual Studio MCP config file (see the [Visual Studio docs](https://learn.microsoft.com/visualstudio/ide/mcp-servers?view=vs-2022) for details):

```json
{
  "mcp": {
    "servers": {
      "human-in-the-loop": {
        "type": "stdio",
        "command": "bunx",
        "args": [
          "-y",
          "human-in-the-loop-mcp",
          "discord",
          "--token",
          "YOUR_DISCORD_BOT_TOKEN",
          "--user-id",
          "YOUR_DISCORD_USER_ID"
        ]
      }
    }
  }
}
```

For more information and troubleshooting, refer to the [Visual Studio MCP Servers documentation](https://learn.microsoft.com/visualstudio/ide/mcp-servers?view=vs-2022).

</details>

<details>
<summary><b>Install in Crush</b></summary>

Add this to your Crush configuration file. See [Crush MCP docs](https://github.com/charmbracelet/crush#mcps) for more info.

```json
{
  "$schema": "https://charm.land/crush.json",
  "mcp": {
    "human-in-the-loop": {
      "type": "stdio",
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Install in BoltAI</b></summary>

Open the "Settings" page of the app, navigate to "Plugins," and enter the following JSON:

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

Once saved, enter in the chat `AskQuestion` followed by your question. More information is available on [BoltAI's Documentation site](https://docs.boltai.com/docs/plugins/mcp-servers). For BoltAI on iOS, [see this guide](https://docs.boltai.com/docs/boltai-mobile/mcp-servers).

</details>

<details>
<summary><b>Install in Rovo Dev CLI</b></summary>

Edit your Rovo Dev CLI MCP config by running the command below -

```bash
acli rovodev mcp
```

Example config -

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Zencoder</b></summary>

To configure Human-In-The-Loop MCP in Zencoder, follow these steps:

1. Go to the Zencoder menu (...)
2. From the dropdown menu, select Agent tools
3. Click on the Add custom MCP
4. Add the name and server configuration from below, and make sure to hit the Install button

```json
{
  "command": "bunx",
  "args": [
    "-y",
    "human-in-the-loop-mcp",
    "discord",
    "--token",
    "YOUR_DISCORD_BOT_TOKEN",
    "--user-id",
    "YOUR_DISCORD_USER_ID"
  ]
}
```

Once the MCP server is added, you can easily continue using it.

</details>

<details>
<summary><b>Install in Qodo Gen</b></summary>

See [Qodo Gen docs](https://docs.qodo.ai/qodo-documentation/qodo-gen/qodo-gen-chat/agentic-mode/agentic-tools-mcps) for more details.

1. Open Qodo Gen chat panel in VSCode or IntelliJ.
2. Click Connect more tools.
3. Click + Add new MCP.
4. Add the following configuration:

```json
{
  "mcpServers": {
    "human-in-the-loop": {
      "command": "bunx",
      "args": [
        "-y",
        "human-in-the-loop-mcp",
        "discord",
        "--token",
        "YOUR_DISCORD_BOT_TOKEN",
        "--user-id",
        "YOUR_DISCORD_USER_ID"
      ]
    }
  }
}
```

</details>

<details>
<summary><b>Install in Perplexity Desktop</b></summary>

See [Local and Remote MCPs for Perplexity](https://www.perplexity.ai/help-center/en/articles/11502712-local-and-remote-mcps-for-perplexity) for more information.

1. Navigate `Perplexity` > `Settings`
2. Select `Connectors`.
3. Click `Add Connector`.
4. Select `Advanced`.
5. Enter Server Name: `Human-In-The-Loop`
6. Paste the following JSON in the text area:

```json
{
  "args": [
    "-y",
    "human-in-the-loop-mcp",
    "discord",
    "--token",
    "YOUR_DISCORD_BOT_TOKEN",
    "--user-id",
    "YOUR_DISCORD_USER_ID"
  ],
  "command": "bunx",
  "env": {}
}
```

7. Click `Save`.
</details>

<details>
<summary><b>Install from source</b></summary>

```bash
git clone https://github.com/AndyRightNow/human-in-the-loop-mcp.git
cd human-in-the-loop-mcp
bun install
bun run build
bun start discord --token YOUR_DISCORD_BOT_TOKEN --user-id YOUR_DISCORD_USER_ID
```

</details>

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
  questions: string; // Questions from the AI
}
```

Expected response:

```typescript
{
  answers: string; // Your response
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
  res.json({ answers: 'Your response here' });
});
```

## Troubleshooting

**Q: The bot isn't sending me messages**

**A**: Ensure you have DMs enabled from server members in your Discord privacy settings.

**Q: Timeout errors**

**A**: Increase the timeout value with the `--timeout` flag (in milliseconds).

**Q: HTTP endpoint not working**

**A**: Verify your endpoint URL, check any required headers, and ensure the endpoint is accessible.

## Contributing

Bug reports and feature requests are welcome. Please open an issue on GitHub.

## License

MIT
