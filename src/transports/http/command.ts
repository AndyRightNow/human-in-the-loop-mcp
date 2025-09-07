import { Answers, Questions } from '@/src/types';
import { BaseTransportCommand } from '../base/command';
import { HTTPTransport } from './transport';

export class HTTPTransportCommand extends BaseTransportCommand<HTTPTransport> {
  constructor() {
    super('http');

    this.option(
      '--url <url>',
      `HTTP URL to handle the questions. The request body will be ${JSON.stringify(
        {
          questions: 'Questions',
        } as Questions
      )} and the response must be ${JSON.stringify({
        answers: 'Answers',
      } as Answers)}`,
      (rawStr) => {
        if (/^https?:\/\//.test(rawStr)) {
          return rawStr;
        }

        throw new Error('Invalid URL');
      }
    );
  }

  protected override getTransport(): HTTPTransport {
    const options = this.opts();

    return new HTTPTransport({
      url: options.url,
    });
  }
}
