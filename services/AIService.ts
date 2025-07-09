import { BaseRequest, ModelRequest } from '../types';
import { ENV_VARIABLES } from '../environment';
import { logger } from '../pino';
import { MakePostCall } from './';
import { MODEL_TYPE } from '../constants';
import { OpenRouterRequest, GeminiRequest, OllamaRequest, } from '../requests';

const getModelRequest = (modelName: string, question: string, systemPrompt?: string, docContent?: string): BaseRequest => {
  switch (ENV_VARIABLES.AI_PROVIDER.toUpperCase()) {
    case MODEL_TYPE.OPEN_ROUTER_AI:
      return new OpenRouterRequest(modelName, question, systemPrompt, docContent);
    case MODEL_TYPE.OLLAMA:
      return new OllamaRequest(modelName, question, systemPrompt, docContent);
    default:
      return new GeminiRequest(modelName, question, systemPrompt, docContent);
  }
}

export const AskQuestionViaAPI = async (modelName: string, question: string, systemPrompt?: string, docContent?: string): Promise<string> => {
  logger.info(`AI Provider is: ${ENV_VARIABLES.AI_PROVIDER}`);
  const modelRequest: BaseRequest = getModelRequest(modelName, question, systemPrompt, docContent);
  const request: ModelRequest = await modelRequest.getRequest();
  const response = await MakePostCall(request);
  return modelRequest.parseResponse(response); // Adjust the type as needed
};
