import { program } from 'commander';
import { DiscordTransportCommand } from '../transports/discord';
import { HTTPTransportCommand } from '../transports/http';

program
  .name('human-in-the-loop-mcp')
  .addCommand(new DiscordTransportCommand())
  .addCommand(new HTTPTransportCommand())
  .parse();
