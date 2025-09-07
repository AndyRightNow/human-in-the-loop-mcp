import { AnswersSchema, Questions } from '@/types';
import { BaseTransport, BaseTransportOptions } from '../base/transport';

export type HTTPTransportOptions = BaseTransportOptions & {
  url: string;
  headers?: Record<string, string>;
};

export class HTTPTransport extends BaseTransport {
  private url: string;
  private headers?: Record<string, string>;

  constructor(options: HTTPTransportOptions) {
    super(options);

    this.url = options.url;
    this.headers = options.headers;
    this.isReady = !!options.url;
  }

  public override async handleQuestions(questions: string): Promise<string> {
    const abortController = new AbortController();

    const abortTimeout = setTimeout(() => {
      abortController.abort();
    }, this.responseTimeout);

    const res = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify({ questions } as Questions),
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
      signal: abortController.signal,
    });

    clearTimeout(abortTimeout);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    const parsed = AnswersSchema.parse(data);

    if (!parsed) {
      throw new Error('No response data');
    }

    return parsed.answers;
  }
}
