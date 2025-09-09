import { resolve } from 'path';
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino/file',
    options: { destination: resolve(__dirname, '../../', `debug.log`) }, // this writes to STDOUT
  },
});
