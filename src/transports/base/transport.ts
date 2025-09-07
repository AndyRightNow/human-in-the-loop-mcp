export type BaseTransportOptions = {
  readyTimeout?: number;
  responseTimeout?: number;
};

export abstract class BaseTransport {
  protected isReady: boolean = false;
  private readyTimeout: number;
  protected responseTimeout: number;

  constructor({ readyTimeout, responseTimeout }: BaseTransportOptions) {
    this.readyTimeout = readyTimeout || 60000;
    this.responseTimeout = responseTimeout || 1000 * 60 * 60;
    this.isReady = false;
  }

  public async sendQuestions(questions: string): Promise<string> {
    await this.waitUntilReady();

    return this.handleQuestions(questions);
  }

  protected abstract handleQuestions(questions: string): Promise<string>;

  protected async waitUntilReady(): Promise<void> {
    const start = Date.now();

    const hasTimedOut = () => Date.now() - start >= this.readyTimeout;

    while (!this.isReady && !hasTimedOut()) {
      await new Promise((resolve) => setTimeout(resolve, 5));
    }

    if (!this.isReady) {
      throw new Error(
        `The ready timeout ${this.readyTimeout} has been reached`
      );
    }
  }
}
