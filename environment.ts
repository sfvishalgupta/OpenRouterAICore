import { config } from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
  config({ path: '.env' });
}

if (process.env.NODE_ENV != '' && fs.existsSync(`.env.${process.env.NODE_ENV}`)) {
  config({ path: `.env.${process.env.NODE_ENV}` });
}

export const ENV_VARIABLES = {
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
  OPEN_ROUTER_MODEL: process.env.OPEN_ROUTER_MODEL ?? '',
  OPEN_ROUTER_API_KEY: process.env.OPEN_ROUTER_API_KEY ?? '',
  OPEN_ROUTER_API_URL: process.env.OPEN_ROUTER_API_URL ?? '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  STREAMING: process.env.STREAMING === 'true',

  VECTOR_STORE_TYPE: process.env.VECTOR_STORE_TYPE ?? 'memory',
  VECTOR_STORE_URL: process.env.VECTOR_STORE_URL ?? 'http://localhost:6333',

  JIRA_URL: process.env.JIRA_URL ?? '',
  JIRA_EMAIL: process.env.JIRA_EMAIL ?? '',
  JIRA_API_TOKEN: process.env.JIRA_API_TOKEN ?? '',
  JIRA_PROJECT_KEY: process.env.JIRA_PROJECT_KEY ?? '',
  JIRA_MAX_RESULT: process.env.JIRA_MAX_RESULT ? parseInt(process.env.JIRA_MAX_RESULT) : 10,
  JIRA_FETCH_FIELDS: process.env.JIRA_FETCH_FIELDS
    ? process.env.JIRA_FETCH_FIELDS.split(',')
    : ['summary', 'status', 'assignee', 'reporter'],

  AI_PROVIDER: process.env.AI_PROVIDER ?? 'OPEN_ROUTER_AI',

  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
  GEMINI_API_URL: process.env.GEMINI_API_URL ?? '',

  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY ?? '',
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY ?? '',
  AWS_REGION: process.env.AWS_REGION ?? '',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME ?? '',

  PRESIDIO_ANALYZE_URL: process.env.PRESIDIO_ANALYZE_URL ?? '',
  PRESIDIO_ANONYMIZE_URL: process.env.PRESIDIO_ANONYMIZE_URL ?? '',

  JIRA_URL_OUTPUT: process.env.JIRA_URL_OUTPUT ?? '',
  JIRA_EMAIL_OUTPUT: process.env.JIRA_EMAIL_OUTPUT ?? '',
  JIRA_API_TOKEN_OUTPUT: process.env.JIRA_API_TOKEN_OUTPUT ?? '',
  JIRA_TICKET_ID: process.env.JIRA_TICKET_ID ?? '',
};
