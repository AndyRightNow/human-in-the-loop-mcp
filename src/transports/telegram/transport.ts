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

type PendingResponse = {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  sentMessage: Message;
  timeout: NodeJS.Timeout;
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
  private pendingResponses = new Map<number, PendingResponse>();

  constructor(options: TelegramTransportOptions) {
    super(options);

    this.chatId = options.chatId;
    this.numericChatId = parseInt(this.chatId, 10);
    this.numericUserId = parseInt(this.userId, 10);

    this.bot = new Bot(this.token);

    // Set up single persistent message handler
    this.setupMessageHandler();

    // Initialize connection asynchronously
    this.initializeConnection();
  }

  private setupMessageHandler(): void {
    this.bot.on('message', async (ctx: Context) => {
      const message = ctx.message;

      // Only process messages from the expected user that are newer than any pending messages
      if (message?.from?.id === this.numericUserId) {
        // Check if chat ID needs to be set
        if (!this.numericChatId) {
          this.numericChatId = message.chat.id;
          await this.createChannel();
        }

        // Add message to queue for processing
        this.messageQueue.push(message);

        // Process any pending responses
        this.processPendingResponses(message);
      }
    });
  }

  private processPendingResponses(newMessage?: Message): void {
    // Process the new message first if provided
    if (newMessage) {
      this.processMessageForPendingResponse(newMessage);
    }

    // Process the entire message queue to check for any matching responses
    for (let i = this.messageQueue.length - 1; i >= 0; i--) {
      const message = this.messageQueue[i];
      if (this.processMessageForPendingResponse(message)) {
        // Remove the processed message from the queue
        this.messageQueue.splice(i, 1);
      }
    }
  }

  private processMessageForPendingResponse(message: Message): boolean {
    for (const [
      messageId,
      pendingResponse,
    ] of this.pendingResponses.entries()) {
      // Check if this is a reply to the pending message
      if (
        message.reply_to_message?.message_id ===
          pendingResponse.sentMessage.message_id &&
        message.date > pendingResponse.sentMessage.date
      ) {
        // Clear timeout and resolve with the response
        clearTimeout(pendingResponse.timeout);
        this.pendingResponses.delete(messageId);
        pendingResponse.resolve(message.text || '');
        return true; // Message was processed
      }
    }

    // If no pending response was found and this is a message from the expected user,
    // send a reminder to reply properly (only if we have any pending responses)
    if (this.pendingResponses.size > 0) {
      this.bot.api
        .sendMessage(
          this.numericChatId,
          `❌ Please reply to my message directly instead of sending a new message. Use the reply feature to respond to my question.`,
          {
            reply_parameters: { message_id: message.message_id },
          }
        )
        .catch(() => {
          // Ignore errors when sending reminder
        });
    }

    return false; // Message was not processed
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
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingResponses.delete(sentMessage.message_id);
        this.clearReminderTimer();
        reject(new Error(`Response timeout exceeded`));
      }, this.responseTimeout);

      // Add to pending responses
      this.pendingResponses.set(sentMessage.message_id, {
        resolve: (response: string) => {
          this.clearReminderTimer();
          resolve(response);
        },
        reject,
        sentMessage,
        timeout,
      });

      // Start reminders if enabled
      this.startReminders(sentMessage);
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
