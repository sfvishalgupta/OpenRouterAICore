import fs from 'fs';
import path from 'path';
import { ConfluenceSearchTool } from '../tools';
import { logger } from '../pino';

function stripHtmlTags(htmlString: string): string {
    return htmlString
        .replace(/<[^>]*>/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .split('\n\n')
        .join('\n')
        .split('\n\n')
        .join('\n')
        .split('{')
        .join('')
        .split('}')
        .join('')
        .split('@sourcefuse.com')
        .join('');
}

export async function DownloadFileFromConfluence(folder: string, filePath: string): Promise<string> {
    filePath = filePath.replace('confluence://', '');
    filePath = filePath.replace('CONFLUENCE://', '');
    const outputFile = folder + '/' + filePath + '.txt';
    if (!fs.existsSync(path.dirname(outputFile))) {
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    }

    logger.info(`Confluence Space Key is ${filePath}`);
    const pages: any[] = await ConfluenceSearchTool().func(filePath);
    let content = '';
    for (const page of pages) {
        content += page.title + '\n';
        content += page.body.storage.value;
    }
    fs.writeFileSync(outputFile, stripHtmlTags(content));
    return outputFile;
}

