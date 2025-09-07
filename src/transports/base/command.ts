import { startMCPServer } from '@/src/mcp';
import { Command } from 'commander';
import { DEFAULT_READY_TIMEOUT, DEFAULT_RESPONSE_TIMEOUT } from './constants';
import { BaseTransport } from './transport';

export abstract class BaseTransportCommand<
  TransportType extends BaseTransport,
> extends Command {
  constructor(name?: string) {
    super(name);

    this.option(
      '--ready-timeout [timeout]',
      `Timeout for the transport to be ready, default to ${DEFAULT_READY_TIMEOUT}ms`
    );
    this.option(
      '--response-timeout [timeout]',
      `Timeout for the human response, default to ${DEFAULT_RESPONSE_TIMEOUT}ms`
    );
    this.option(
      '--custom-tool-description [description]',
      'Custom tool description'
    );

    this.action(async () => {
      const options = this.opts();

      await startMCPServer({
        transport: this.getTransport(),
        customToolDescription: options.customToolDescription,
      });
    });
  }

  protected abstract getTransport(): TransportType;
}
