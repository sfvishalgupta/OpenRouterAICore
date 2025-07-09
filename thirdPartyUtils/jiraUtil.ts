/**
 * Extracts text content from the description of a Jira issue.
 * Traverses the content structure and collects text from all paragraphs.
 *
 * @param jiraIssue - The Jira issue object containing the description field.
 * @returns An array of strings, each representing a paragraph of text extracted from the description.
 */
import { ERRORS, ENV_VARIABLES } from '../environment';
import { JiraSearchTool } from '../tools';
import { JiraIssue } from '../types';
import { logger } from '../pino';
import { CustomError } from '../customError';

/**
 * This function extracts text from the Jira issue description.
 * It traverses the content structure of the Jira issue and collects text from paragraphs.
 *
 * @param jiraIssue - The Jira issue object containing the description.
 * @returns An array of strings, each representing a paragraph of text.
 */
const extractParagraphText = (jiraIssue: any): string[] => {
    const result: string[] = [];
    function traverse(node: any) {
        if (!node) return;

        if (node.type === 'paragraph' && Array.isArray(node.content)) {
            const text = node.content
                .filter((child: any) => child.type === 'text')
                .map((child: any) => child.text)
                .join('');
            if (text.trim()) result.push(text);
        }

        if (Array.isArray(node.content)) {
            node.content.forEach(traverse);
        }
    }

    traverse(jiraIssue);
    return result;
};

/**
 * This function fetches the Jira title and description for the given Jira ticket ID.
 * It uses the JiraSearchTool to search for the issue and formats the output.
 */
export const GetJiraTitle = async (): Promise<string> => {
    if (!ENV_VARIABLES.JIRA_TICKET_ID || !ENV_VARIABLES.JIRA_PROJECT_KEY) {
        throw new CustomError(
            ERRORS.ENV_NOT_SET,
            'Jira ticket ID or Project key is not set in environment variables.'
        )
    }

    let jiraId: string = GetJiraId();
    const jql: string = `project = '${ENV_VARIABLES.JIRA_PROJECT_KEY}' AND (key = ${jiraId} OR parent = ${jiraId})`;
    logger.info(`JQL: ${jql} `);
    try {
        const response: JiraIssue[] = await JiraSearchTool.func(jql);
        const parentIssue: JiraIssue = response.find((issue) => issue.key === jiraId) as JiraIssue;
        const subIssues: JiraIssue[] = response.filter((issue) => issue.key !== jiraId);

        let placeHolder: string = `Jira Story is below in format of title : description` +
            `**${parentIssue.key} :- ${parentIssue.fields.summary}** : ${extractParagraphText(parentIssue.fields.description).join('\n')}`;
        if (subIssues.length > 0) {
            placeHolder += `\n\nJira sub story is below in format of title : description
            ${subIssues.map((issue) => `- **${issue.fields.summary}**: ${extractParagraphText(issue.fields.description).join('\n')}`).join('\n')}`;
        }
        return placeHolder.trim();
    } catch (e) {
        if (typeof e === 'object' && e !== null && 'response' in e) {
            if ((e as any).response?.status) {
                throw new CustomError(
                    ERRORS.INVALID_CREDENTIALS,
                    'Make sure your Jira credentials (username, password, or API token) are correct and valid'
                );
            }
        } else if (e instanceof Error) {
            if (e.message.toLowerCase().indexOf('getaddrinfo') > -1) {
                throw new CustomError(
                    ERRORS.URL_NOT_FOUND,
                    'Make sure your Jira url is valid'
                );
            }
            throw new Error(`Error found in fetching Jira Details by ID ${jiraId} :- ${e.message}`);
        } else {
            console.log(2);
            throw new Error(`Error found in fetching Jira Details by ID ${jiraId} :- ${String(e)}`);
        }
    }
    return '';
};


/**
 * Extracts and returns the Jira ticket ID from the environment variable `JIRA_TICKET_ID`.
 *
 * The function attempts to match the Jira ticket ID using the pattern `PROJECT-123` (uppercase letters, hyphen, digits).
 * If a match is found, it returns the matched Jira ticket ID; otherwise, it returns the original value of `JIRA_TICKET_ID`.
 *
 * @returns {string} The extracted Jira ticket ID, or the original value if no match is found.
 */

export const GetJiraId = (): string => {
    let jiraId: string = ENV_VARIABLES.JIRA_TICKET_ID;
    const regex = /^([A-Z]+-\d+)/;
    const match = regex.exec(ENV_VARIABLES.JIRA_TICKET_ID.toString());
    if (match) {
        jiraId = match[1];
    }
    return jiraId;
}
