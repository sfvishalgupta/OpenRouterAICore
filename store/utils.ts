import { ENV_VARIABLES } from '../environment';
import { VECTOR_STORE_TYPE } from '../constants';
import { BaseVector } from './baseVector';
import { QdrantVector } from './qdrantVector';
import { logger } from '../pino';

export const GetStore = (): BaseVector => {
  if (ENV_VARIABLES.VECTOR_STORE_TYPE.toUpperCase() == VECTOR_STORE_TYPE.QDRANT) {
    logger.info('Using Qdrant Vector Store');
    return new QdrantVector();
  }
  logger.info('Using Memory Vector Store');
  return new QdrantVector();
};
