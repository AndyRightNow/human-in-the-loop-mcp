import {
  Client,
  DMChannel,
  Events,
  GatewayIntentBits,
  Message,
  User,
} from 'discord.js';
import { BaseTransport, BaseTransportOptions } from '../base/transport';

export type DiscordTransportOptions = BaseTransportOptions & {
  token: string;
  userId: string;
  remind?: boolean;
  remindInterval?: number;
};

export class DiscordTransport extends BaseTransport {
  private client: Client;
  private user: User | undefined;
  private dmChannel: DMChannel | undefined;
  private remind: boolean;
  private remindInterval: number;
  private reminderTimer?: NodeJS.Timeout;
  private lastReminderMessage?: Message;

  constructor(options: DiscordTransportOptions) {
    super(options);

    this.responseTimeout = options.responseTimeout || this.responseTimeout;
    this.remind = options.remind ?? false;
    this.remindInterval = options.remindInterval ?? 60000;

    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    });

    this.client.once(Events.ClientReady, async () => {
      this.user = await this.client.users.fetch(options.userId);

      if (!this.user) {
        throw new Error(`User with ID ${options.userId} not found`);
      }

      let dmChannel = this.user.dmChannel || (await this.user.createDM());

      if (!dmChannel) {
        throw new Error(`Failed to create DM channel with user`);
      }

      this.dmChannel = dmChannel;

      this.isReady = true;
    });

    this.client.login(options.token);
  }

  public override async handleQuestions(questions: string): Promise<string> {
    if (!this.dmChannel) {
      throw new Error(`DM Channel not found`);
    }

    const sentMessage = await this.dmChannel.send(questions);

    if (!sentMessage) {
      throw new Error(
        `Failed to send message, please see https://discordjs.guide/popular-topics/errors.html#cannot-send-messages-to-this-user`
      );
    }

    return new Promise((resolve, reject) => {
      if (!this.dmChannel) {
        reject(new Error(`DM Channel not found`));
        return;
      }

      const cleanup = () => {
        this.clearReminderTimer();
      };

      try {
        const messageCollector = this.dmChannel.createMessageCollector({
          filter: (message) => message.author.id === this.user?.id,
          time: this.responseTimeout,
        });

        // Start reminders if enabled
        if (this.remind) {
          this.startReminders(sentMessage);
        }

        messageCollector.on('collect', (message) => {
          if (message.reference?.messageId === sentMessage.id) {
            cleanup();
            resolve(message.content);
            messageCollector.stop();
            return;
          }

          if (this.dmChannel) {
            this.dmChannel.send(
              `❌ Please reply to my message directly instead of sending a new message. Use the reply feature to respond to my question.`
            );
          }
        });

        messageCollector.on('end', () => {
          cleanup();
          reject(new Error(`Response timeout exceeded`));
        });
      } catch (e: unknown) {
        cleanup();
        reject(new Error(`Failed to create message collector: ${e}`));
      }
    });
  }

  private startReminders(originalMessage: Message): void {
    this.reminderTimer = setTimeout(() => {
      this.sendReminder(originalMessage);
    }, this.remindInterval);
  }

  private async sendReminder(originalMessage: Message): Promise<void> {
    if (!this.dmChannel) {
      return;
    }

    try {
      // Try to delete the previous reminder message
      if (this.lastReminderMessage) {
        try {
          await this.lastReminderMessage.delete();
        } catch (error) {
          // Ignore deletion errors (message might already be deleted, no permissions, etc.)
        }
      }

      // Send new reminder message that replies to the original question
      this.lastReminderMessage = await this.dmChannel.send({
        content: `⏰ Reminder: Please respond to my question`,
        reply: { messageReference: originalMessage.id },
      });

      // Schedule next reminder
      this.reminderTimer = setTimeout(() => {
        this.sendReminder(originalMessage);
      }, this.remindInterval);
    } catch (error) {
      // If sending reminder fails, don't schedule next one
      this.clearReminderTimer();
    }
  }

  private clearReminderTimer(): void {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
      this.reminderTimer = undefined;
    }
    this.lastReminderMessage = undefined;
  }
}
