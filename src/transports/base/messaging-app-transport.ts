import { BaseTransport, BaseTransportOptions } from './transport';

export type MessagingAppTransportOptions = BaseTransportOptions & {
  token: string;
  userId: string;
  remind?: boolean;
  remindInterval?: number;
};

export abstract class MessagingAppTransport<
  MessageType = unknown,
  UserType = unknown,
  ChannelType = unknown,
> extends BaseTransport {
  protected token: string;
  protected userId: string;
  protected user: UserType | undefined;
  protected channel: ChannelType | undefined;
  protected remind: boolean;
  protected remindInterval: number;
  protected reminderTimer?: NodeJS.Timeout;
  protected lastReminderMessage?: MessageType;

  constructor(options: MessagingAppTransportOptions) {
    super(options);

    this.token = options.token;
    this.userId = options.userId;
    this.remind = options.remind ?? false;
    this.remindInterval = options.remindInterval ?? 60000;
  }

  protected startReminders(originalMessage: MessageType): void {
    if (!this.remind) {
      return;
    }

    this.reminderTimer = setTimeout(() => {
      this.sendReminder(originalMessage);
    }, this.remindInterval);
  }

  protected clearReminderTimer(): void {
    if (this.reminderTimer) {
      clearTimeout(this.reminderTimer);
      this.reminderTimer = undefined;
    }
    this.lastReminderMessage = undefined;
  }

  protected abstract sendReminder(originalMessage: MessageType): Promise<void>;

  protected abstract initializeConnection(): Promise<void>;

  protected abstract validateUser(): Promise<void>;

  protected abstract createChannel(): Promise<void>;
}