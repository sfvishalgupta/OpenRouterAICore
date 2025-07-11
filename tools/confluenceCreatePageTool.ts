import { DynamicTool } from 'langchain/tools';
import { ConfluenceClient } from 'confluence.js';
import { ENV_VARIABLES } from '../environment';
import { logger } from '../pino';
import { ConfluencePage } from '../types'

class Confluence {
    private readonly client: ConfluenceClient;
    constructor(
        private readonly host: string,
        private readonly email: string,
        private readonly apiToken: string,
        private readonly spaceKey: string,
        private readonly ticketId: string
    ) {
        this.client = new ConfluenceClient({
            host: this.host,
            authentication: {
                basic: {
                    email: this.email,
                    apiToken: this.apiToken,
                },
            },
        });
    }

    async getPageIdByTitle(title: string): Promise<string> {
        const response = await this.client.content.getContent({
            spaceKey: this.spaceKey,
            title,
            expand: 'ancestors',
        });
        if (response.results && response.results.length > 0) {
            return response.results[0].id;
        }
        return "";
    }

    async createAPage(parentId: string | null, title: string, content: string): Promise<string> {
        content = content.replace('```markdown', '');
        content = content.replace('```', '');

        try {
            const page: ConfluencePage = {
                type: 'page',
                title,
                space: {
                    key: this.spaceKey,
                },
                body: {
                    storage: {
                        value: content,
                        representation: 'storage',
                    },
                },
            };
            if (parentId) {
                page.ancestors = [
                    {
                        id: parentId,
                    },
                ];
            }
            const response = await this.client.content.createContent(page);
            logger.info(`Page created: ${response.id}`);
            return response.id;
        } catch (e) {
            if (typeof e == 'object') {
                logger.error(`Error creating Confluence page: ${JSON.stringify(e)}`);
            } else {
                logger.error(`Error creating Confluence page: ${e instanceof Error ? e.message : e}`);
            }
            return await this.getPageIdByTitle(title);
        }
    }

    async createPage(content: string): Promise<any> {
        try {
            const projectId: string = await this.createAPage(null, `${ENV_VARIABLES.JIRA_PROJECT_KEY}-QUALITY-CHECK`, '');
            const pageId: string = await this.createAPage(projectId, this.ticketId, '');
            const pageTitle: string = `${this.ticketId}-${Date.now()}`;
            const responseId: string = await this.createAPage(pageId, pageTitle, content);
            return {
                pageId: responseId,
                pageTitle
            }
        } catch (error) {
            if (typeof error == 'object') {
                console.log(JSON.stringify(error));
            }
            console.error(`Error creating page: ${error}`);
        }
    }
}

export const ConfluenceCreatePageTool = (
    host: string, email: string, apiToken: string,
    spaceKey: string, ticketId: string
) =>
    new DynamicTool({
        name: 'confluence-create-page-tool',
        description: 'Create page in Confluence',
        func: async (content) => new Confluence(
            host,
            email,
            apiToken,
            spaceKey,
            ticketId
        ).createPage(content)
    });
