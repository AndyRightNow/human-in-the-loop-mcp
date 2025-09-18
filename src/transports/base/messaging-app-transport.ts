import { logger } from '@/utils/logger';
import { randomUUID } from 'crypto';
import { BaseTransport, BaseTransportOptions } from './transport';

export type MessagingAppTransportOptions = BaseTransportOptions & {
  token: string;
  userId: string;
  remind?: boolean;
  remindInterval?: number;
};

enum QuestionStatus {
  PENDING = 'PENDING',
  ANSWERED = 'ANSWERED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED',
}

interface TrackedQuestion<MessageType> {
  id: string;
  originalMessage: MessageType;
  status: QuestionStatus;
  timestamp: number;
  lastReminderTime: number;
  lastReminderMessage?: MessageType;
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  timeoutHandle: NodeJS.Timeout;
}

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

  private trackedQuestions = new Map<string, TrackedQuestion<MessageType>>();
  private reminderInterval?: NodeJS.Timeout;

  constructor(options: MessagingAppTransportOptions) {
    super(options);

    this.token = options.token;
    this.userId = options.userId;
    this.remind = options.remind ?? false;
    this.remindInterval = options.remindInterval ?? 60000;

    if (this.remind) {
      logger.debug(
        `Starting reminder system with interval: ${this.remindInterval}ms`
      );
      this.startReminderSystem();
    } else {
      logger.debug('Reminders disabled');
    }
  }

  private startReminderSystem(): void {
    logger.debug(
      `Setting up reminder interval timer: ${this.remindInterval}ms`
    );
    this.reminderInterval = setInterval(() => {
      this.checkReminders();
    }, this.remindInterval);
  }

  private async checkReminders(): Promise<void> {
    const now = Date.now();
    logger.debug(
      `Checking reminders. Current questions: ${this.trackedQuestions.size}`
    );

    for (const [
      questionId,
      trackedQuestion,
    ] of this.trackedQuestions.entries()) {
      logger.debug(
        `Question ${questionId}: status=${trackedQuestion.status}, lastReminder=${new Date(trackedQuestion.lastReminderTime).toISOString()}`
      );

      if (trackedQuestion.status !== QuestionStatus.PENDING) {
        logger.debug(
          `Removing non-pending question ${questionId} with status ${trackedQuestion.status}`
        );
        this.trackedQuestions.delete(questionId);
        continue;
      }

      const timeSinceLastReminder = now - trackedQuestion.lastReminderTime;
      logger.debug(
        `Question ${questionId}: timeSinceLastReminder=${timeSinceLastReminder}ms, interval=${this.remindInterval}ms`
      );

      if (timeSinceLastReminder >= this.remindInterval) {
        logger.debug(`Sending reminder for question ${questionId}`);
        try {
          const reminderMessage = await this.sendReminder(
            questionId,
            trackedQuestion.originalMessage,
            trackedQuestion.lastReminderMessage
          );
          trackedQuestion.lastReminderMessage = reminderMessage;
          trackedQuestion.lastReminderTime = now;
        } catch (error) {
          logger.error(
            `Failed to send reminder for question ${questionId}: ${error}`
          );
        }
      }
    }
  }

  private cleanupQuestion(questionId: string): void {
    const trackedQuestion = this.trackedQuestions.get(questionId);
    if (trackedQuestion) {
      clearTimeout(trackedQuestion.timeoutHandle);
      this.trackedQuestions.delete(questionId);
    }
  }

  public async handleQuestions(questions: string): Promise<string> {
    const questionId = randomUUID();
    logger.debug(
      `Starting handleQuestions with questionId: ${questionId}, remind: ${this.remind}`
    );

    try {
      const originalMessage = await this.sendQuestionMessage(questions);

      return new Promise<string>((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
          const trackedQuestion = this.trackedQuestions.get(questionId);
          if (trackedQuestion) {
            trackedQuestion.status = QuestionStatus.TIMEOUT;
            this.cleanupQuestion(questionId);
            reject(new Error('Response timeout exceeded'));
          }
        }, this.responseTimeout);

        const now = Date.now();
        logger.debug(
          `Creating tracked question ${questionId} at ${new Date(now).toISOString()}`
        );
        const trackedQuestion: TrackedQuestion<MessageType> = {
          id: questionId,
          originalMessage,
          status: QuestionStatus.PENDING,
          timestamp: now,
          lastReminderTime: now,
          resolve: (value: string) => {
            const question = this.trackedQuestions.get(questionId);
            if (question) {
              question.status = QuestionStatus.ANSWERED;
              this.cleanupQuestion(questionId);
              resolve(value);
            }
          },
          reject: (error: Error) => {
            const question = this.trackedQuestions.get(questionId);
            if (question) {
              question.status = QuestionStatus.CANCELLED;
              this.cleanupQuestion(questionId);
              reject(error);
            }
          },
          timeoutHandle,
        };

        this.trackedQuestions.set(questionId, trackedQuestion);
        logger.debug(
          `Tracked question ${questionId} added to map. Total questions: ${this.trackedQuestions.size}`
        );

        this.collectResponse(originalMessage)
          .then(trackedQuestion.resolve)
          .catch(trackedQuestion.reject);
      });
    } catch (error) {
      this.cleanupQuestion(questionId);
      throw error;
    }
  }

  protected abstract sendQuestionMessage(
    question: string
  ): Promise<MessageType>;

  protected abstract collectResponse(
    originalMessage: MessageType
  ): Promise<string>;

  protected abstract sendReminder(
    questionId: string,
    originalMessage: MessageType,
    previousReminderMessage?: MessageType
  ): Promise<MessageType | undefined>;

  protected abstract initializeConnection(): Promise<void>;

  protected abstract validateUser(): Promise<void>;

  protected abstract createChannel(): Promise<void>;

  protected cleanup(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = undefined;
    }

    for (const questionId of this.trackedQuestions.keys()) {
      this.cleanupQuestion(questionId);
    }
  }
}
