import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import packageJSON from '../../package.json';
import { BaseTransport } from '../transports/base/transport';
import { QuestionsSchema } from '../types';

// Create an MCP server
const server = new McpServer({
  name: 'human-in-the-loop-mcp-server',
  version: packageJSON.version,
});

// Start receiving messages on stdin and sending messages on stdout
export async function startMCPServer<TransportType extends BaseTransport>({
  transport,
  customToolDescription,
}: {
  transport: TransportType;
  customToolDescription?: string;
}) {
  // Add an addition tool
  server.registerTool(
    'AskQuestion',
    {
      title: 'Ask Question Tool',
      description:
        customToolDescription ||
        'Use this tool when you need to ask either a clarifying question, or a decision-making question.',
      inputSchema: QuestionsSchema.shape,
    },
    async ({ questions }) => ({
      content: [
        {
          type: 'text',
          text: await transport.sendQuestions(questions),
        },
      ],
    })
  );

  await server.connect(new StdioServerTransport());
}
