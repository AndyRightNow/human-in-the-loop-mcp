import { logger } from '@/utils/logger';
import { Bot, Context } from 'grammy';
import type { Message } from 'grammy/types';
import {
  MessagingAppTransport,
  MessagingAppTransportOptions,
} from '../base/messaging-app-transport';

export type TelegramTransportOptions = MessagingAppTransportOptions & {
  chatId: string;
};

export class TelegramTransport extends MessagingAppTransport<
  Message,
  number,
  string
> {
  private bot: Bot;
  private chatId: string;
  private numericChatId: number;
  private numericUserId: number;

  constructor(options: TelegramTransportOptions) {
    super(options);

    this.chatId = options.chatId;
    this.numericChatId = parseInt(this.chatId, 10);
    this.numericUserId = parseInt(this.userId, 10);

    this.bot = new Bot(this.token);

    // Initialize connection asynchronously
    this.initializeConnection();
  }

  protected async initializeConnection(): Promise<void> {
    await this.validateUser();
    await this.createChannel();
    this.isReady = true;
  }

  protected async validateUser(): Promise<void> {
    try {
      const me = await this.bot.api.getMe();
      logger.debug({ me }, `Telegram bot validated:`);

      // For Telegram, we store the bot's user ID
      this.user = me.id;
    } catch (error) {
      throw new Error(`Failed to validate Telegram bot: ${error}`);
    }
  }

  protected async createChannel(): Promise<void> {
    if (!this.numericChatId) {
      return;
    }

    try {
      // Get chat info to validate chat ID
      await this.bot.api.getChat(this.numericChatId);

      // For Telegram, we just store the chat ID as the channel
      this.channel = this.chatId;
    } catch (error) {
      throw new Error(`Failed to get chat info: ${error}`);
    }
  }

  public override async handleQuestions(questions: string): Promise<string> {
    logger.debug(`Handling questions: ${questions}`);

    const sentMessage = await this.bot.api.sendMessage(
      this.numericUserId || this.numericChatId,
      questions
    );

    if (!sentMessage) {
      throw new Error(`Failed to send message to chat`);
    }

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        this.clearReminderTimer();
        this.bot.stop();
      };

      // Set up message handler
      this.bot.on('message', async (ctx: Context) => {
        const message = ctx.message;

        // Check if message is from the expected user
        if (
          message?.from?.id === this.numericUserId &&
          message.date > sentMessage.date
        ) {
          if (!this.numericChatId) {
            this.numericChatId = message.chat.id;
            await this.createChannel();
          }

          // Check if this is a reply to our message
          if (message.reply_to_message?.message_id === sentMessage.message_id) {
            cleanup();
            resolve(message.text || '');
            return;
          }

          // If it's not a reply, send a reminder to reply properly
          ctx.reply(
            `❌ Please reply to my message directly instead of sending a new message. Use the reply feature to respond to my question.`,
            {
              reply_parameters: { message_id: message.message_id },
            }
          );
        }
      });

      // Start the bot
      this.bot.start();

      // Start reminders if enabled
      this.startReminders(sentMessage);

      // Set timeout
      setTimeout(() => {
        cleanup();
        reject(new Error(`Response timeout exceeded`));
      }, this.responseTimeout);
    });
  }

  protected async sendReminder(originalMessage: Message): Promise<void> {
    if (!this.channel) {
      return;
    }

    try {
      // Try to delete the previous reminder message
      if (this.lastReminderMessage) {
        try {
          await this.bot.api.deleteMessage(
            this.numericChatId,
            this.lastReminderMessage.message_id
          );
        } catch (error) {
          console.error('Failed to delete previous reminder message:', error);
        }
      }

      // Send new reminder message that replies to the original question
      this.lastReminderMessage = await this.bot.api.sendMessage(
        this.numericChatId,
        `⏰ Reminder: Please respond to my question`,
        {
          reply_parameters: { message_id: originalMessage.message_id },
        }
      );

      // Schedule next reminder
      this.reminderTimer = setTimeout(() => {
        this.sendReminder(originalMessage);
      }, this.remindInterval);
    } catch {
      // If sending reminder fails, don't schedule next one
      this.clearReminderTimer();
    }
  }
}
