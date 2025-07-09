import fs from 'fs';
import { getDocumentContent } from '../utils';
import { downloadFileFromS3 } from '../services/S3Service';
import { logger } from '../pino';
import { CustomError } from '../customError';
import { ENV_VARIABLES, ERRORS } from '../environment';
import { DownloadFileFromConfluence } from './';

export function GetSystemPrompt(systemPromptPath: string): Promise<string> {
    if (!fs.existsSync(systemPromptPath)) {
        throw new CustomError(ERRORS.FILE_NOT_FOUND, systemPromptPath);
    }
    return getDocumentContent(systemPromptPath);
}

export function GetSummarizePrompt(): string {
    return `use this context and give me the summary of the context and 
give me the output in below format as json with key summary & score, 
do not include score in summary and score should be string in format <b>x/10</b>.`;
}

/**
 * This function is the entry point for the OpenRouterAI example.
 */
export async function GetUserPrompt(): Promise<string> {
    const useFor: string = ENV_VARIABLES.USE_FOR.includes(".") ? ENV_VARIABLES.USE_FOR : ENV_VARIABLES.USE_FOR + '.txt';
    logger.info('Reading User Prompt file from:- ' + useFor);
    let filePath: string = process.cwd() + '/' + useFor;

    if (useFor.toUpperCase().indexOf('S3') > -1) {
        logger.info('User Prompt from: S3');
        filePath = await downloadFileFromS3('tmp', useFor);
    } else {
        logger.info('User Prompt from: local');
    }
    if (!fs.existsSync(filePath)) {
        throw new CustomError(ERRORS.FILE_NOT_FOUND,
            filePath
        );
    }
    return getDocumentContent(filePath);
}

export async function GetProjectDocument(projectDocumentPath?: string): Promise<string> {
    let content: string = '';
    projectDocumentPath = projectDocumentPath ?? ENV_VARIABLES.PROJECT_DOCUMENT_PATH;
    logger.info(`Loading Project document from ${projectDocumentPath}`);
    const listOfFiles: string[] = projectDocumentPath.split(',');
    for (let filepath of listOfFiles) {
        const trimmedFilepath = filepath.trim();
        let localFilePath: string = process.cwd() + '/' + trimmedFilepath;
        if (trimmedFilepath.toUpperCase().indexOf('S3') > -1) {
            logger.info('Project Document is in : S3');
            localFilePath = await downloadFileFromS3('tmp', trimmedFilepath);
            logger.info(`Downloaded project document from S3: ${localFilePath}`);
        } else if (trimmedFilepath.toUpperCase().indexOf('CONFLUENCE') > -1) {
            logger.info(`Downloaded project document from Confluence: ${trimmedFilepath}`);
            localFilePath = await DownloadFileFromConfluence('tmp', trimmedFilepath);
        } else {
            logger.info(`Project Document is in : Local ${localFilePath}`);
        }

        if (!fs.existsSync(localFilePath)) {
            throw new CustomError(
                ERRORS.FILE_NOT_FOUND,
                localFilePath
            );
        }
        content += await getDocumentContent(localFilePath);
    }
    return content;
}

export function GetReportFileContent(reportFilePath: string): Promise<any> {
    logger.info('Reading Report file from :- ' + reportFilePath);
    if (!fs.existsSync(reportFilePath)) {
        throw new CustomError(
            ERRORS.FILE_NOT_FOUND,
            reportFilePath
        );
    }
    return getDocumentContent(reportFilePath);
}
