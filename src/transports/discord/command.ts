import { BaseTransportCommand } from '../base/command';
import { DiscordTransport } from './transport';

export class DiscordTransportCommand extends BaseTransportCommand<DiscordTransport> {
  constructor() {
    super('discord');

    this.option('--token <token>', 'Discord bot token');
    this.option('--user-id <user-id>', 'Discord user ID');
    this.option(
      '--remind',
      'Send reminder messages while waiting for response'
    );
    this.option(
      '--remind-interval <ms>',
      'Reminder interval in milliseconds (default: 60000)',
      '60000'
    );
  }

  protected override getTransport(): DiscordTransport {
    const options = this.opts();

    return new DiscordTransport({
      token: options.token,
      userId: options.userId,
      remind: options.remind,
      remindInterval: parseInt(options.remindInterval, 10),
    });
  }
}
