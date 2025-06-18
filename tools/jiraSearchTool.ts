import axios from 'axios';
import { DynamicTool } from 'langchain/tools';
import { ENV_VARIABLES } from '../environment';

export const JiraSearchTool = new DynamicTool({
  name: 'jira-issue-search',
  description: 'Search Jira issues using JQL query.',
  func: async (jql: string) => {
    const auth = Buffer.from(`${ENV_VARIABLES.JIRA_EMAIL}:${ENV_VARIABLES.JIRA_API_TOKEN}`).toString('base64');

    const res = await axios.get(`${ENV_VARIABLES.JIRA_URL}/rest/api/3/search`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
      params: {
        jql,
        maxResults: ENV_VARIABLES.JIRA_MAX_RESULT, // Default to 50 if not set
        fields: ENV_VARIABLES.JIRA_FETCH_FIELDS, // Fetch specific fields
      },
    });

    return res.data.issues;
  },
});
