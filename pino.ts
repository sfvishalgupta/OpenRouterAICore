import pino from 'pino';
import { ENV_VARIABLES } from './environment';

export const logger = pino({
  level: ENV_VARIABLES.LOG_LEVEL,
});
