# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that enables human-in-the-loop functionality for AI assistants through Discord or HTTP. It allows AI assistants to request human input/clarification through an `AskQuestion` tool.

## Development Commands

```bash
# Build the TypeScript project
bun run build

# Start the CLI (with Bun)
bun start

# Lint the codebase
bun run lint

# Format code with Prettier
bun run format

# Install dependencies
bun install
```

## Architecture

The codebase follows a modular transport-based architecture:

- **CLI Entry**: `src/cli/index.ts` - Commander-based CLI that registers transport commands
- **MCP Server**: `src/mcp/index.ts` - Core MCP server that registers the `AskQuestion` tool
- **Transports**: `src/transports/` - Pluggable transport implementations
  - `base/` - Abstract base classes for transports and commands
  - `discord/` - Discord bot implementation for receiving/sending questions
  - `http/` - HTTP webhook implementation for questions/answers
- **Types**: `src/types/` - TypeScript types and Zod schemas

### Key Design Patterns

1. **Transport Abstraction**: All transports extend `BaseTransport` and implement a `handleQuestions()` method
2. **Command Pattern**: Each transport has a corresponding Command class extending `BaseTransportCommand`
3. **MCP Integration**: The server uses stdio transport and registers tools dynamically based on the selected transport

## Type Safety

The project uses strict TypeScript with comprehensive type safety:

### Zod Schema Validation
- `QuestionsSchema` - Validates questions input (minimum 2 characters)
- `AnswersSchema` - Validates human response answers (minimum 2 characters)
- Runtime validation ensures type safety at boundaries

### Generic Transport Typing
```typescript
// All command classes are strongly typed to their transport
export abstract class BaseTransportCommand<TransportType extends BaseTransport>

// Transport methods use explicit string types for questions/answers
protected abstract handleQuestions(questions: string): Promise<string>
```

### Type Organization
- All types exported from `src/types/index.ts` for consistent imports
- Zod schemas with `z.infer<>` generate TypeScript types automatically
- Abstract base classes enforce implementation contracts

## Important Configuration

- Uses Bun as the primary runtime (see `packageManager` in package.json)
- TypeScript strict mode: ALL strict flags enabled (noImplicitAny, strictNullChecks, alwaysStrict)
- Path aliases configured: `@/*` maps to `./src/*`
- Target: ESNext with NodeNext modules for optimal compatibility
- Builds to `./dist` directory with `tsc` and `tsc-alias` for path resolution
