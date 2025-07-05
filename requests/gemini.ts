import { BaseRequest, ModelRequest } from '../types';
import { ENV_VARIABLES } from '../environment';
export class GeminiRequest implements BaseRequest {
  constructor(
    private readonly modelName: string,
    private readonly question: string,
    private readonly systemPrompt?: string,
    private readonly document?: string,
  ) {}

  parseResponse = (response: any): string => {
    try {
      return response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error parsing Gemini response:', error.message);
      } else {
        console.error('Error parsing Gemini response:', error);
      }
      return '';
    }
  };

  getMessages = async (): Promise<any[]> => {
    const messages: any[] = [];
    if (this.systemPrompt?.trim() !== '') {
      messages.push({
        role: 'user',
        parts: [
          {
            text: this.systemPrompt,
          },
        ],
      });
    }

    if (this.document?.trim() !== '') {
      messages.push({
        role: 'user',
        parts: [
          {
            text: `Here is the document:\n"""${this.document}"""\n\n`,
          },
        ],
      });
    }

    messages.push({
      role: 'user',
      parts: [{ text: `${this.question}\n\n` }],
    });
    return messages;
  };

  async getRequest(): Promise<ModelRequest> {
    return {
      url: `${ENV_VARIABLES.GEMINI_API_URL}?key=${ENV_VARIABLES.GEMINI_API_KEY}`,
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost', // optional but recommended
        'X-Title': 'my-test-app', // optional but recommended
      },
      body: { contents: await this.getMessages() },
      responseType: ENV_VARIABLES.STREAMING ? 'stream' : 'json',
    };
  }
}
