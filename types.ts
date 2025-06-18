export interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    description: string;
  };
}

export interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}
export interface OpenRouterChoice {
  message: OpenRouterMessage;
}
export interface OpenRouterMessage {
  content: string;
}

export interface PostRequest {
  url: string;
  headers: any;
  body: any;
  responseType: string;
}

export interface BaseRequest {
  getRequest(): Promise<PostRequest>;
  parseResponse(response: any): string;
}

export interface ModelRequest {
  url: string;
  headers: any;
  body: any;
  responseType: string;
}

export interface ConfluencePage {
  type: string;
  title: string;
  space: { key: string };
  body: { storage: { value: string; representation: string } };
  ancestors?: { id: string }[];
}