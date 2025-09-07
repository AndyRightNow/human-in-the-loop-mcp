import { AnswersSchema, Questions } from '@/src/types';
import { BaseTransport, BaseTransportOptions } from '../base/transport';

export type HTTPTransportOptions = BaseTransportOptions & {
  url: string;
};

export class HTTPTransport extends BaseTransport {
  private url: string;

  constructor(options: HTTPTransportOptions) {
    super(options);

    this.url = options.url;
    this.isReady = !!options.url;
  }

  public override async handleQuestions(questions: string): Promise<string> {
    const res = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify({ questions } as Questions),
      headers: {
        'Content-Type': 'application/json',
      },
    });

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
