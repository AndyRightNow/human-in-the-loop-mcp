import { BaseTransportCommand } from '../base/command';
import { DiscordTransport } from './transport';

export class DiscordTransportCommand extends BaseTransportCommand<DiscordTransport> {
  constructor() {
    super('discord');

    this.option('--token <token>', 'Discord bot token');
    this.option('--user-id <user-id>', 'Discord user ID');
  }

  protected override getTransport(): DiscordTransport {
    const options = this.opts();

    return new DiscordTransport({
      token: options.token,
      userId: options.userId,
    });
  }
}
