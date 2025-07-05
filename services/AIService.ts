import { MakePostCall } from './';
import { ENV_VARIABLES } from '../environment';
import { MODEL_TYPE } from '../constants';
import { BaseRequest } from '../types';
import { OpenRouterRequest, GeminiRequest } from '../requests';

export const AskQuestionViaAPI = async (modelName:string, question: string, systemPrompt?: string, docContent?: string): Promise<any> => {
  let modelRequest: BaseRequest;
  if (ENV_VARIABLES.AI_PROVIDER.toUpperCase() === MODEL_TYPE.OPEN_ROUTER_AI) {
    modelRequest = new OpenRouterRequest(modelName, question, systemPrompt, docContent);
  } else {
    modelRequest = new GeminiRequest(modelName, question, systemPrompt, docContent);
  }

  const request = await modelRequest.getRequest();
  const response = await MakePostCall(request);
  return modelRequest.parseResponse(response) as any; // Adjust the type as needed
};
