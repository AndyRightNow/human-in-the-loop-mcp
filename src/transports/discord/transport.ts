import { Client, Events, GatewayIntentBits, User } from 'discord.js';
import { BaseTransport, BaseTransportOptions } from '../base/transport';

export type DiscordTransportOptions = BaseTransportOptions & {
  token: string;
  userId: string;
};

export class DiscordTransport extends BaseTransport {
  private client: Client;
  private user: User | undefined;

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

      this.isReady = true;
    });

    this.client.login(options.token);
  }

  public override async handleQuestions(questions: string): Promise<string> {
    if (!this.user) {
      throw new Error(`User not found`);
    }

    let dmChannel = this.user.dmChannel || (await this.user.createDM());

    if (!dmChannel) {
      throw new Error(`Failed to create DM channel with user`);
    }

    const sentMessage = await dmChannel.send(questions);

    if (!sentMessage) {
      throw new Error(
        `Failed to send message, please see https://discordjs.guide/popular-topics/errors.html#cannot-send-messages-to-this-user`
      );
    }

    const messageCollection = await dmChannel.awaitMessages({
      filter: (message) => message.author.id === this.user?.id,
      max: 1,
      time: this.responseTimeout,
    });

    const message = messageCollection?.first();

    if (!message) {
      throw new Error(`No response received within ${this.responseTimeout}ms`);
    }

    return message.content;
  }
}
