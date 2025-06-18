import fs from 'fs';
import path from 'path';
import { logger } from './pino';

const pdf = require('pdf-parse');

const patterns: any = {
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  phone: /(\+?\d{1,3}[-.\s]?|\()?\d{3}[-.\s)]?\d{3}[-.\s]?\d{4}/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  ip: /\b\d{1,3}(\.\d{1,3}){3}\b/g,
  creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
  jwtToken: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
  url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  uuid: /[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}/g,
};

export const ReadPDFDocument = async (filePath: string): Promise<string> => {
  if (fs.existsSync(filePath)) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }
  throw new Error(`File not found: ${filePath}`);
};

export const ReadTextDocument = async (filePath: string): Promise<string> => {
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  }
  throw new Error(`File not found: ${filePath}`);
};

export const getDocumentContent = async (filePath: string): Promise<string> => {
  const fileExtension = path.extname(filePath).toLowerCase();
  let content = '';
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  switch (fileExtension) {
    case '.pdf':
      content = await ReadPDFDocument(filePath);
      break;
    case '.txt':
    case '.json':
      content = await ReadTextDocument(filePath);
      break;
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }
  return content;
};

export const RedactPII = (text: string): string => {
  for (const key in patterns) {
    if (patterns[key].test(text)) {
      logger.info(`The matched value ${key}`);
      text = text.replace(patterns[key], ``);
    }
  }
  return text
    .replace(/<[^>]*>/g, '')
    .split('&nbsp;')
    .join('')
    .replace(/\s+/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\n\s*\n/g, '\n')
    .split('{')
    .join('')
    .split('}')
    .join('')
    .split('@sourcefuse.com')
    .join('')
    .split('sourcefuse')
    .join('')
    .split('Sourcefuse')
    .join('')
    .split('SourceFuse')
    .join('')
    .split('.com')
    .join('');
};
