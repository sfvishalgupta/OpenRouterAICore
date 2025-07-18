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

  JIRA_TICKET_ID: process.env.JIRA_TICKET_ID ?? '',

  GITHUB_OWNER: process.env.GITHUB_OWNER ?? '',
  GITHUB_REPO: process.env.GITHUB_REPO ?? '',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? '',
  PROJECT_DOCUMENT_PATH: process.env.PROJECT_DOCUMENT_PATH ?? '',
  GITHUB_ISSUE_NUMBER: process.env.GITHUB_ISSUE_NUMBER ?? '',

  USE_FOR: process.env.USE_FOR ?? 'GenerateTestCasesReport_API',
};

export const ERRORS = {
  ENV_NOT_SET: "ENV_NOT_SET",
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  URL_NOT_FOUND: "URL_NOT_FOUND",
}