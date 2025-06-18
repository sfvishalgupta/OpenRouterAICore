/**
 * QdrantVector is a class that implements the BaseVector interface for managing vector storage and retrieval
 * using Qdrant as the backend vector database. It provides methods to add documents, retrieve similar documents,
 * and generate responses using a language model based on retrieved context.
 *
 * @remarks
 * - Uses Qdrant for vector storage and similarity search.
 * - Uses FakeEmbeddings for embedding generation (replace with actual embeddings in production).
 * - Supports chunking of documents for efficient storage and retrieval.
 * - Integrates with language models to generate responses based on context.
 *
 * @example
 * ```typescript
 * const vector = new QdrantVector();
 * await vector.addDocument('my-collection', 'Some text to store');
 * const response = await vector.generate('gpt-3.5-turbo', 'my-collection', 'What is this about?');
 * ```
 */

import { Document } from '@langchain/core/documents';
import { EmbeddingsInterface } from '@langchain/core/embeddings';
import { FakeEmbeddings } from 'langchain/embeddings/fake';
import { PromptTemplate } from '@langchain/core/prompts';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/community/vectorstores/qdrant';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { ChatOpenAIModel } from '../models';
import { BaseVector } from './';
import { ENV_VARIABLES } from '../environment';
import { logger } from '../pino';
import { RedactPII } from '../utils';
import { RemovePIIData } from '../services';

const CHUNK_OVERLAP = 50;
const CHUNK_SIZE = 500;
const DEFAULT_TOP_K = 5;
const VECTOR_DISTANCE = 'Cosine';
const VECTOR_SIZE = 4;

export class QdrantVector implements BaseVector {
  private getEmbeddings(): EmbeddingsInterface {
    // Replace FakeEmbeddings with actual embeddings in production
    return new FakeEmbeddings({});
  }

  private getClient(): QdrantClient {
    return new QdrantClient({ url: ENV_VARIABLES.VECTOR_STORE_URL });
  }

  private async ensureCollection(client: QdrantClient, collectionName: string): Promise<void> {
    await client.recreateCollection(collectionName, {
      vectors: {
        size: VECTOR_SIZE,
        distance: VECTOR_DISTANCE,
      },
    });
    logger.info(`Collection '${collectionName}' recreated.`);
  }

  private async getVectorStore(collectionName: string): Promise<QdrantVectorStore> {
    try {
      return await QdrantVectorStore.fromExistingCollection(this.getEmbeddings(), {
        client: this.getClient(),
        collectionName,
      });
    } catch (error) {
      logger.error(`Error getting vector store for '${collectionName}': ${error}`);
      throw error;
    }
  }

  private async retrieve(collectionName: string, query: string, topK: number = DEFAULT_TOP_K): Promise<string[]> {
    try {
      const vectorStore = await this.getVectorStore(collectionName);
      const results = await vectorStore.similaritySearch(query, topK);
      return results.map((result) => result.pageContent);
    } catch (error) {
      logger.error(`Error retrieving documents from '${collectionName}': ${error}`);
      return [];
    }
  }

  /**
   * Add a document to the vector store.
   * @param collectionName
   * @param text
   */
  public async addDocument(collectionName: string, text: string): Promise<void> {
    logger.info(`Storing data in Qdrant on index '${collectionName}'`);
    const client = this.getClient();
    await this.ensureCollection(client, collectionName);

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });
    const vectorStore = await this.getVectorStore(collectionName);
    text = RedactPII(text);
    const docs: Document[] = await splitter.createDocuments([text]);
    await vectorStore.addDocuments(docs);
  }

  /**
   * Generate a response based on the context and query.
   * @param collectionName
   * @param query
   * @returns
   */
  public async generate(
    modelName: string,
    collectionName: string,
    query: string,
  ): Promise<string | AsyncIterable<string>> {
    const retrievedDocuments = await this.retrieve(collectionName, query);
    let context = '';
    for (const txt of retrievedDocuments) {
      context += await RemovePIIData(txt);
    }
    return this.makeCallToModel(modelName, context, query);
  }

  public async makeCallToModel(modelName: string, context: string, query: string):
    Promise<string | AsyncIterable<string>> {
    logger.info(`Length of a context is ${context.length}`);
    const prompt = PromptTemplate.fromTemplate(
      `Based on the following context: ${context}, answer the question: ${query}`,
    );
    const sequence = RunnableSequence.from([
      {
        context: () => `<context>${context}</context>`,
        question: () => query,
      },
      prompt,
      ChatOpenAIModel(modelName),
      new StringOutputParser(),
    ]);

    return sequence.invoke({});
  }
}
