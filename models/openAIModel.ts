/**
 * Provides factory functions to create instances of the ChatOpenAI model
 * from the @langchain/openai package, configured to use OpenRouter API credentials
 * and endpoints defined in the environment variables.
 *
 * @module openAIModel
 */

/**
 * Creates a ChatOpenAI instance with the specified model name,
 * configured to use the OpenRouter API key and base URL from environment variables.
 *
 * @param modelName - The name of the OpenAI model to use (e.g., "gpt-3.5-turbo").
 * @returns A configured ChatOpenAI instance for standard (non-streaming) usage.
 */

/**
 * Creates a ChatOpenAI instance with the specified model name,
 * configured for streaming responses, using the OpenRouter API key and base URL
 * from environment variables.
 *
 * @param modelName - The name of the OpenAI model to use (e.g., "gpt-3.5-turbo").
 * @returns A configured ChatOpenAI instance with streaming enabled.
 */
import { ChatOpenAI } from '@langchain/openai';
import { ENV_VARIABLES } from '../environment';

export const ChatOpenAIModel = (modelName: string) => {
  return new ChatOpenAI({
    openAIApiKey: ENV_VARIABLES.OPEN_ROUTER_API_KEY,
    modelName,
    configuration: {
      baseURL: ENV_VARIABLES.OPEN_ROUTER_API_URL,
    },
  });
};

export const ChatOpenAIModelWithStreaming = (modelName: string) => {
  return new ChatOpenAI({
    openAIApiKey: ENV_VARIABLES.OPEN_ROUTER_API_KEY,
    modelName,
    configuration: {
      baseURL: ENV_VARIABLES.OPEN_ROUTER_API_URL,
    },
    streaming: true,
  });
};
