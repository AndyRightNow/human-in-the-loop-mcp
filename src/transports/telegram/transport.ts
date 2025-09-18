import { logger } from '@/utils/logger';
import { Bot, Context } from 'grammy';
import type { Message } from 'grammy/types';
import { convert } from 'telegram-markdown-v2';
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
  private messageQueue: Message[] = [];
  private currentCollector?: {
    originalMessage: Message;
    resolve: (value: string) => void;
    reject: (error: Error) => void;
  };

  constructor(options: TelegramTransportOptions) {
    super(options);

    this.chatId = options.chatId;
    this.numericChatId = parseInt(this.chatId, 10);
    this.numericUserId = parseInt(this.userId, 10);

    logger.debug(
      `Telegram constructor: chatId=${this.chatId}, numericChatId=${this.numericChatId}, userId=${this.userId}, numericUserId=${this.numericUserId}`
    );

    this.bot = new Bot(this.token);

    // Set up single persistent message handler
    this.setupMessageHandler();

    // Initialize connection asynchronously
    this.initializeConnection();
  }

  private setupMessageHandler(): void {
    this.bot.on('message', async (ctx: Context) => {
      const message = ctx.message;

      // Only process messages from the expected user
      if (message?.from?.id === this.numericUserId) {
        // Check if chat ID needs to be set
        if (!this.numericChatId) {
          this.numericChatId = message.chat.id;
          await this.createChannel();
        }

        // Add message to queue for processing
        this.messageQueue.push(message);

        // Process if we have a current collector
        if (this.currentCollector) {
          await this.processMessageForCollector(message);
        }
      }
    });
  }

  private async processMessageForCollector(message: Message): Promise<void> {
    if (!this.currentCollector) {
      return;
    }

    // Check if this is a reply to the pending message
    if (
      message.reply_to_message?.message_id ===
        this.currentCollector.originalMessage.message_id &&
      message.date > this.currentCollector.originalMessage.date
    ) {
      // Resolve with the response
      this.currentCollector.resolve(message.text || '');
      this.currentCollector = undefined;
      return;
    }

    // If not a proper reply, send reminder
    await this.bot.api.sendMessage(
      this.numericChatId,
      `❌ Please reply to my message directly instead of sending a new message. Use the reply feature to respond to my question.`,
      {
        reply_parameters: { message_id: message.message_id },
      }
    );
  }

  protected async initializeConnection(): Promise<void> {
    await this.validateUser();
    await this.createChannel();

    // Start the bot once and keep it running
    this.bot.start();
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

  protected async sendQuestionMessage(question: string): Promise<Message> {
    logger.debug(`Sending question: ${question}`);

    const sentMessage = await this.bot.api.sendMessage(
      this.numericUserId || this.numericChatId,
      convert(question),
      {
        parse_mode: 'MarkdownV2',
      }
    );

    if (!sentMessage) {
      throw new Error(`Failed to send message to chat`);
    }

    return sentMessage;
  }

  protected async collectResponse(originalMessage: Message): Promise<string> {
    return new Promise((resolve, reject) => {
      this.currentCollector = {
        originalMessage,
        resolve,
        reject,
      };

      // Process any queued messages that might already be responses
      for (const message of this.messageQueue) {
        if (
          message.reply_to_message?.message_id === originalMessage.message_id &&
          message.date > originalMessage.date
        ) {
          this.currentCollector = undefined;
          resolve(message.text || '');
          return;
        }
      }
    });
  }

  protected async sendReminder(
    questionId: string,
    originalMessage: Message,
    previousReminderMessage?: Message
  ): Promise<Message | undefined> {
    logger.debug(
      `Telegram sendReminder called for question ${questionId}, message_id: ${originalMessage.message_id}`
    );

    logger.debug(
      `sendReminder: numericChatId=${this.numericChatId}, chatId=${this.chatId}, numericUserId=${this.numericUserId}`
    );

    const targetChatId = this.numericUserId || this.numericChatId;
    if (!targetChatId) {
      logger.debug('No valid chat ID or user ID available for reminder');
      return undefined;
    }

    try {
      // Delete previous reminder message if it exists
      if (previousReminderMessage) {
        try {
          await this.bot.api.deleteMessage(
            targetChatId,
            previousReminderMessage.message_id
          );
          logger.debug(
            `Deleted previous Telegram reminder message ${previousReminderMessage.message_id}`
          );
        } catch (error) {
          logger.debug(
            `Could not delete previous Telegram reminder message: ${error}`
          );
        }
      }

      // Send new reminder message
      logger.debug(`Sending Telegram reminder to chat ${targetChatId}`);
      const reminderMessage = await this.bot.api.sendMessage(
        targetChatId,
        `⏰ Reminder: Please respond to my question`,
        {
          reply_parameters: { message_id: originalMessage.message_id },
        }
      );
      logger.debug(
        `Telegram reminder sent successfully, reminder message_id: ${reminderMessage.message_id}`
      );
      return reminderMessage;
    } catch (error) {
      logger.error(`Failed to send Telegram reminder: ${error}`);
      return undefined;
    }
  }
}
