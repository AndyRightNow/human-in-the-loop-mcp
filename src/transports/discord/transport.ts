import { Client, DMChannel, Events, GatewayIntentBits, User } from 'discord.js';
import { BaseTransport, BaseTransportOptions } from '../base/transport';

export type DiscordTransportOptions = BaseTransportOptions & {
  token: string;
  userId: string;
};

export class DiscordTransport extends BaseTransport {
  private client: Client;
  private user: User | undefined;
  private dmChannel: DMChannel | undefined;

  constructor(options: DiscordTransportOptions) {
    super(options);

    this.responseTimeout = options.responseTimeout || this.responseTimeout;

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

      try {
        const messageCollector = this.dmChannel.createMessageCollector({
          filter: (message) => message.author.id === this.user?.id,
          time: this.responseTimeout,
        });

        messageCollector.on('collect', (message) => {
          if (message.reference?.messageId === sentMessage.id) {
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
          reject(new Error(`Response timeout exceeded`));
        });
      } catch (e: unknown) {
        reject(new Error(`Failed to create message collector: ${e}`));
      }
    });
  }
}
