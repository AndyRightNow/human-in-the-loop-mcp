import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "human-in-the-loop-mcp-server",
  version: "1.0.0",
});

// Start receiving messages on stdin and sending messages on stdout
export async function startMCPServer({
  onQuestions,
}: {
  onQuestions: (questions: string[]) => Promise<string[]>;
}) {
  // Add an addition tool
  server.registerTool(
    "AskQuestion",
    {
      title: "Ask Question Tool",
      description:
        "Use this tool when you need to ask either a clarifying question, or a decision-making question.",
      inputSchema: {
        questions: z.array(z.string().min(1)).min(1),
      },
    },
    async ({ questions }) => ({
      content: [
        { type: "text", text: (await onQuestions(questions)).join("\n") },
      ],
    }),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
