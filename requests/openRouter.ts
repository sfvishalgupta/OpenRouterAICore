import { BaseRequest, ModelRequest } from '../types';
import { ENV_VARIABLES } from '../environment';
export class OpenRouterRequest implements BaseRequest {
  constructor(
    private readonly question: string,
    private readonly systemPrompt?: string,
    private readonly document?: string,
  ) {}

  parseResponse = (response: any): string => {
    try {
      return response.data.choices[0].message.content ?? '';
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error parsing OpenRouter response:', error.message);
      } else {
        console.error('Error parsing OpenRouter response:', error);
      }
      return '';
    }
  };

  async getMessages(): Promise<any[]> {
    const messages: any[] = [];
    if (this.systemPrompt && this.systemPrompt?.trim() !== '') {
      messages.push({
        role: 'system',
        content: this.systemPrompt,
      });
    }
    if (this.document && this.document?.trim() !== '') {
      messages.push({
        role: 'user',
        content: `Here is the document:\n"""${this.document}"""\n\n`,
      });
    }

    messages.push({
      role: 'user',
      content: `${this.question}\n\n`,
    });

    return messages;
  }

  async getRequest(): Promise<ModelRequest> {
    return {
      url: `${ENV_VARIABLES.OPEN_ROUTER_API_URL}/chat/completions`,
      headers: {
        Authorization: `Bearer ${ENV_VARIABLES.OPEN_ROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: {
        model: ENV_VARIABLES.OPEN_ROUTER_MODEL,
        stream: ENV_VARIABLES.STREAMING,
        messages: await this.getMessages(),
      },
      responseType: ENV_VARIABLES.STREAMING ? 'stream' : 'json',
    };
  }
}
