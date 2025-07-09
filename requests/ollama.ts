import { BaseRequest, ModelRequest } from "../types";
import { ENV_VARIABLES } from "../environment";
import { logger } from '../pino';

export class OllamaRequest implements BaseRequest {
    constructor(
        private readonly modelName: string,
        private readonly question: string,
        private readonly systemPrompt?: string,
        private readonly document?: string,
    ) {
        logger.info('Initializing OLLAMA');
    }

    parseResponse = (response: any): Promise<string> => {
        return new Promise((resolve, reject) => {
            let fullResponse = '';
            response.data.on('data', (chunk: string) => {
                const chunkString = chunk.toString();
                try {
                    const jsonChunk = JSON.parse(chunkString);
                    fullResponse += jsonChunk.response;
                    if (jsonChunk.done) {
                        resolve(fullResponse);
                    }
                } catch (error) {
                    reject('Error parsing JSON chunk: ' + error);
                }
            });
        });
    };

    async getRequest(): Promise<any> {
        logger.info(`Making API Request for ${ENV_VARIABLES.OPEN_ROUTER_API_URL}`);
        logger.info(`Model Name ${this.modelName}`);
        let prompt: string = "";
        if (this.document && this.document?.trim() !== '') {
            prompt += `Here is the document:\n"""${this.document}"""\n\n`;
        }
        prompt += `${this.question}\n\n`;
        const body = {
            model: this.modelName,
            prompt,
            system: this.systemPrompt,
            "max_tokens": 100,
            "temperature": 0.7
        }

        return {
            url: `${ENV_VARIABLES.OPEN_ROUTER_API_URL}/api/generate`,
            headers: {
                'Content-Type': 'application/json'
            },
            body,
            responseType: 'stream'
        };
    }
}