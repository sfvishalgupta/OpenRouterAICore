import { DynamicTool } from 'langchain/tools';
import { ConfluenceClient } from 'confluence.js';
import { ENV_VARIABLES } from '../environment';
import { logger } from '../pino';
import { ConfluencePage } from '../types'

class Confluence {
    private readonly client: ConfluenceClient;
    constructor(private readonly spaceKey: string) {
        if (
            ENV_VARIABLES.JIRA_URL_OUTPUT.trim() == "" ||
            ENV_VARIABLES.JIRA_EMAIL_OUTPUT.trim() == "" ||
            ENV_VARIABLES.JIRA_API_TOKEN_OUTPUT.trim() == "") {
            throw new Error("Confluence Output details not set.");
        }
        this.client = new ConfluenceClient({
            host: ENV_VARIABLES.JIRA_URL_OUTPUT,
            authentication: {
                basic: {
                    email: ENV_VARIABLES.JIRA_EMAIL_OUTPUT,
                    apiToken: ENV_VARIABLES.JIRA_API_TOKEN_OUTPUT,
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
            logger.error(`Error creating Confluence page: ${e instanceof Error ? e.message : e}`);
            return await this.getPageIdByTitle(title);
        }
    }

    async createPage(content: string): Promise<any> {
        try {
            const projectId: string = await this.createAPage(null, ENV_VARIABLES.JIRA_PROJECT_KEY, '');
            const pageId: string = await this.createAPage(projectId, ENV_VARIABLES.JIRA_TICKET_ID, '');
            const pageTitle: string = `${ENV_VARIABLES.JIRA_TICKET_ID} ${new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' })}`;
            await this.createAPage(pageId, pageTitle, content);
        } catch (error) {
            if (typeof error == 'object') {
                console.log(JSON.stringify(error));
            }
            console.error(`Error creating page: ${error}`);
        }
    }
}

export const ConfluenceCreatePageTool = (spaceKey: string) =>
    new DynamicTool({
        name: 'confluence-create-page-tool',
        description: 'Create page in Confluence',
        func: async (content) => new Confluence(spaceKey).createPage(content)
    });

