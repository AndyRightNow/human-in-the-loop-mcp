import {
  Client,
  DMChannel,
  Events,
  GatewayIntentBits,
  Message,
  User,
} from 'discord.js';
import {
  MessagingAppTransport,
  MessagingAppTransportOptions,
} from '../base/messaging-app-transport';

export type DiscordTransportOptions = MessagingAppTransportOptions;

export class DiscordTransport extends MessagingAppTransport<
  Message,
  User,
  DMChannel
> {
  private client: Client;

  constructor(options: DiscordTransportOptions) {
    super(options);

    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    });

    this.client.once(Events.ClientReady, async () => {
      await this.initializeConnection();
      this.isReady = true;
    });

    this.client.login(this.token);
  }

  protected async initializeConnection(): Promise<void> {
    await this.validateUser();
    await this.createChannel();
  }

  protected async validateUser(): Promise<void> {
    this.user = await this.client.users.fetch(this.userId);

    if (!this.user) {
      throw new Error(`User with ID ${this.userId} not found`);
    }
  }

  protected async createChannel(): Promise<void> {
    if (!this.user) {
      throw new Error('User must be validated before creating channel');
    }

    const dmChannel = this.user.dmChannel || (await this.user.createDM());

    if (!dmChannel) {
      throw new Error(`Failed to create DM channel with user`);
    }

    this.channel = dmChannel;
  }

  public override async handleQuestions(questions: string): Promise<string> {
    if (!this.channel) {
      throw new Error(`DM Channel not found`);
    }

    const sentMessage = await this.channel.send(questions);

    if (!sentMessage) {
      throw new Error(
        `Failed to send message, please see https://discordjs.guide/popular-topics/errors.html#cannot-send-messages-to-this-user`
      );
    }

    return new Promise((resolve, reject) => {
      if (!this.channel) {
        reject(new Error(`DM Channel not found`));
        return;
      }

      const cleanup = () => {
        this.clearReminderTimer();
      };

      try {
        const messageCollector = this.channel.createMessageCollector({
          filter: (message) => message.author.id === this.user?.id,
          time: this.responseTimeout,
        });

        // Start reminders if enabled
        this.startReminders(sentMessage);

        messageCollector.on('collect', (message) => {
          if (message.reference?.messageId === sentMessage.id) {
            cleanup();
            resolve(message.content);
            messageCollector.stop();
            return;
          }

          if (this.channel) {
            this.channel.send(
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

  protected async sendReminder(originalMessage: Message): Promise<void> {
    if (!this.channel) {
      return;
    }

    try {
      // Try to delete the previous reminder message
      if (this.lastReminderMessage) {
        try {
          await this.lastReminderMessage.delete();
        } catch {
          // Ignore deletion errors (message might already be deleted, no permissions, etc.)
        }
      }

      // Send new reminder message that replies to the original question
      this.lastReminderMessage = await this.channel.send({
        content: `⏰ Reminder: Please respond to my question`,
        reply: { messageReference: originalMessage.id },
      });

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
