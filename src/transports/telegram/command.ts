import { BaseTransportCommand } from '../base/command';
import { TelegramTransport } from './transport';

export class TelegramTransportCommand extends BaseTransportCommand<TelegramTransport> {
  constructor() {
    super('telegram');

    this.option('--token <token>', 'Telegram bot token');
    this.option('--chat-id <chat-id>', 'Telegram chat ID or user ID');
    this.option(
      '--user-id <user-id>',
      'Telegram user ID (defaults to chat-id if not specified)'
    );
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

  protected override getTransport(): TelegramTransport {
    const options = this.opts();

    return new TelegramTransport({
      token: options.token,
      userId: options.userId || options.chatId, // Use explicit user-id or fallback to chat-id
      chatId: options.chatId,
      remind: options.remind,
      remindInterval: parseInt(options.remindInterval, 10),
    });
  }
}
