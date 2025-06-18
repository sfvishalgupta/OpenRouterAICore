import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

import { ENV_VARIABLES } from '../environment';
import { logger } from '../pino';

export async function downloadFileFromS3(folder: string, filePath: string): Promise<string> {
  try {
    filePath = filePath.replace('s3://', '');
    filePath = filePath.replace('S3://', '');
    if (!fs.existsSync(path.dirname(folder + '/' + filePath))) {
      fs.mkdirSync(path.dirname(folder + '/' + filePath), { recursive: true });
    }

    if (!ENV_VARIABLES.AWS_REGION || !ENV_VARIABLES.AWS_ACCESS_KEY || !ENV_VARIABLES.AWS_SECRET_KEY) {
      throw new Error('AWS credentials are not set in environment variables.');
    }
    const s3Client = new S3Client({
      region: ENV_VARIABLES.AWS_REGION,
      credentials: {
        accessKeyId: ENV_VARIABLES.AWS_ACCESS_KEY,
        secretAccessKey: ENV_VARIABLES.AWS_SECRET_KEY,
      },
    });
    logger.info(`Downloading file from Bucket: ${ENV_VARIABLES.S3_BUCKET_NAME}, Key: ${filePath}`);

    const command = new GetObjectCommand({
      Bucket: ENV_VARIABLES.S3_BUCKET_NAME,
      Key: filePath,
    });

    const response: any = await s3Client.send(command);
    const fileContent: string = await response.Body?.transformToByteArray();
    const downloadedFilePath: string = process.cwd() + '/tmp/' + filePath;
    if (fileContent) {
      fs.writeFileSync(downloadedFilePath, Buffer.from(fileContent));
      return downloadedFilePath;
    } else {
      throw new Error('No file content received from S3');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error downloading file from S3: ${error.message}`);
    } else {
      console.error(`Error downloading file from S3: ${String(error)}`);
    }
    throw error; // Re-throw the error for further handling
  }
}
