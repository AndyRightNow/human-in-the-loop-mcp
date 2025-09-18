import { logger } from '@/utils/logger';
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

  protected async sendQuestionMessage(question: string): Promise<Message> {
    if (!this.channel) {
      throw new Error(`DM Channel not found`);
    }

    const sentMessage = await this.channel.send(question);

    if (!sentMessage) {
      throw new Error(
        `Failed to send message, please see https://discordjs.guide/popular-topics/errors.html#cannot-send-messages-to-this-user`
      );
    }

    return sentMessage;
  }

  protected async collectResponse(originalMessage: Message): Promise<string> {
    if (!this.channel) {
      throw new Error(`DM Channel not found`);
    }

    return new Promise((resolve, reject) => {
      try {
        const messageCollector = this.channel!.createMessageCollector({
          filter: (message) => message.author.id === this.user?.id,
          time: this.responseTimeout,
        });

        messageCollector.on('collect', (message) => {
          if (message.reference?.messageId === originalMessage.id) {
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
          reject(new Error(`Response timeout exceeded`));
        });
      } catch (e: unknown) {
        reject(new Error(`Failed to create message collector: ${e}`));
      }
    });
  }

  protected async sendReminder(
    questionId: string,
    originalMessage: Message,
    previousReminderMessage?: Message
  ): Promise<Message | undefined> {
    if (!this.channel) {
      return undefined;
    }

    try {
      // Delete previous reminder message if it exists
      if (previousReminderMessage) {
        try {
          await previousReminderMessage.delete();
          logger.debug(
            `Deleted previous Discord reminder message ${previousReminderMessage.id}`
          );
        } catch (error) {
          logger.debug(
            `Could not delete previous Discord reminder message: ${error}`
          );
        }
      }

      // Send new reminder message
      const reminderMessage = await this.channel.send({
        content: `⏰ Reminder: Please respond to my question`,
        reply: { messageReference: originalMessage.id },
      });

      logger.debug(`Sent Discord reminder message ${reminderMessage.id}`);
      return reminderMessage;
    } catch (error) {
      logger.error(`Failed to send Discord reminder: ${error}`);
      return undefined;
    }
  }
}
