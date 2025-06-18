import { DynamicTool } from 'langchain/tools';
import { ConfluenceClient } from 'confluence.js';
import { ENV_VARIABLES } from '../environment';
import { logger } from '../pino';

class Confluence {
  private readonly client: ConfluenceClient;
  constructor(private readonly spaceKey: string) {
    this.client = new ConfluenceClient({
      host: ENV_VARIABLES.JIRA_URL,
      authentication: {
        basic: {
          email: ENV_VARIABLES.JIRA_EMAIL,
          apiToken: ENV_VARIABLES.JIRA_API_TOKEN,
        },
      },
    });
  }

  async listPages(): Promise<any[]> {
    let start = 0;
    const limit = 100; // Adjust the limit based on your needs
    let hasMorePages = true;
    let allPages: any[] = [];
    while (hasMorePages) {
      try {
        logger.info(`fetching for starting:- ${start}`);
        const pages = await this.client.content.getContent({
          spaceKey: this.spaceKey,
          type: 'page',
          start,
          limit,
          expand: ['body.storage'],
        });

        start += limit;
        hasMorePages = pages.size >= limit;
        allPages = [...allPages, ...pages.results];
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        } else if (typeof error == 'object') {
          console.error(`Error: ${JSON.stringify(error)}`);
        } else {
          console.error(`Error: ${String(error)}`);
        }
        hasMorePages = false;
      }
    }
    return allPages;
  }
}

export const ConfluenceSearchTool = () =>
  new DynamicTool({
    name: 'confluence-search-tool',
    description: 'List Confluence Spaces, Pages etc.',
    func: async (spaceKey: string) => {
      return new Confluence(spaceKey).listPages();
    },
  });
