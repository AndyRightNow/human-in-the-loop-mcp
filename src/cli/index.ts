import { program } from 'commander';
import { version } from '../../package.json';
import { DiscordTransportCommand } from '../transports/discord';
import { HTTPTransportCommand } from '../transports/http';
import { TelegramTransportCommand } from '../transports/telegram';

program
  .name('human-in-the-loop-mcp')
  .version(version)
  .addCommand(new DiscordTransportCommand())
  .addCommand(new HTTPTransportCommand())
  .addCommand(new TelegramTransportCommand())
  .parse();
