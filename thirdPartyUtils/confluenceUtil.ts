import fs from 'fs';
import path from 'path';
import { ConfluenceSearchTool } from '../tools';
import { logger } from '../pino';
import { ENV_VARIABLES } from '../environment';

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
        if (!page.title.toLowerCase().startsWith(ENV_VARIABLES.JIRA_PROJECT_KEY.toLocaleLowerCase()+"-")) {
            // if(page.title == "TDD for Course Management (PLM-2545)"){
                content += page.title + '\n';
                content += page.body.storage.value.trim();
            // }
        }
    }
    fs.writeFileSync(outputFile, stripHtmlTags(content));
    return outputFile;
}
