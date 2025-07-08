import { Octokit } from 'octokit';
import { ENV_VARIABLES } from '../environment';
import { PullRequestFile } from '../types';
import { logger } from '..//pino';

const octokit = new Octokit({
    auth: ENV_VARIABLES.GITHUB_TOKEN, // Replace with your GitHub token
});

export interface CommentList {
    [id: number]: string
};

export async function GetPullRequestDiff(): Promise<string[]> {
    const files: string[] = [];
    try {
        const pull_number = ENV_VARIABLES.GITHUB_ISSUE_NUMBER;
        if (!pull_number) {
            throw new Error('GITHUB_ISSUE_NUMBER is not set in environment variables');
        }
        logger.info(`Pull Request Number is ${pull_number}`);

        if (ENV_VARIABLES.GITHUB_OWNER.trim() == '') {
            throw new Error('GITHUB_OWNER is not set in environment variables');
        }
        logger.info(`Github Owner is ${ENV_VARIABLES.GITHUB_OWNER}`);

        if (ENV_VARIABLES.GITHUB_REPO.trim() == '') {
            throw new Error('GITHUB_REPO is not set in environment variables');
        }
        logger.info(`Github Repo is ${ENV_VARIABLES.GITHUB_REPO}`);

        const listFilesResponse = await octokit.rest.pulls.listFiles({
            owner: ENV_VARIABLES.GITHUB_OWNER,
            repo: ENV_VARIABLES.GITHUB_REPO,
            pull_number: Number(pull_number),
        });

        (listFilesResponse.data as PullRequestFile[]).forEach((file: PullRequestFile) => {
            files.push(file.filename);
        });
    } catch (e) {
        if (e instanceof Error) {
            logger.info(`Error found in git diff function: ${e.message}`);
        } else {
            logger.info(`Error found in git diff function: ${String(e)}`);
        }
    }
    return files;
}

export async function ListComments(): Promise<CommentList> {
    const issue_number: string = `${ENV_VARIABLES.GITHUB_ISSUE_NUMBER}`;
    const commentList: CommentList = {};

    if (!issue_number) {
        throw new Error('GITHUB_ISSUE_NUMBER is not set in environment variables');
    }

    const response = await octokit.rest.issues.listComments({
        owner: ENV_VARIABLES.GITHUB_OWNER,
        repo: ENV_VARIABLES.GITHUB_REPO,
        issue_number: Number(issue_number),
    });
    const comments = response.data;
    comments.forEach((comment: typeof response.data[number]) => {
        commentList[comment.id] = comment.body;
    });
    return commentList;
}

export async function DeleteComments(id: number) {
    return octokit.rest.issues.deleteComment({
        owner: ENV_VARIABLES.GITHUB_OWNER,
        repo: ENV_VARIABLES.GITHUB_REPO,
        comment_id: id,
    });
}

export async function CreateUpdateComments(comment: string, id?: number):Promise<any> {
    if (id) {
        logger.info("Updating comment for id " + id);
        console.log({
            owner: ENV_VARIABLES.GITHUB_OWNER,
            repo: ENV_VARIABLES.GITHUB_REPO,
            comment_id: id,
            body: comment,
        });
        return octokit.rest.issues.updateComment({
            owner: ENV_VARIABLES.GITHUB_OWNER,
            repo: ENV_VARIABLES.GITHUB_REPO,
            comment_id: id,
            body: comment,
        });
    }

    logger.info("Creating comment");
    return octokit.rest.issues.createComment({
        owner: ENV_VARIABLES.GITHUB_OWNER,
        repo: ENV_VARIABLES.GITHUB_REPO,
        issue_number: Number(ENV_VARIABLES.GITHUB_ISSUE_NUMBER),
        body: comment,
    });
}
