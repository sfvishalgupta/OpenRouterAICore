
/**
 * Interface representing the base operations for a vector store.
 *
 * @interface BaseVector
 */
 
/**
 * Adds a document to the specified collection.
 *
 * @param collectionName - The name of the collection to which the document will be added.
 * @param text - The text content of the document to add.
 * @returns A promise that resolves when the document has been added.
 */
 
/**
 * Generates a result using the specified model and index for a given query.
 *
 * @param modelName - The name of the model to use for generation.
 * @param indexName - The name of the index to use.
 * @param query - The query string to generate results for.
 * @returns A promise that resolves with the generated result.
 */
 
/**
 * Makes a call to the specified model with the provided context and query.
 *
 * @param modelName - The name of the model to call.
 * @param context - The context to provide to the model.
 * @param query - The query string for the model.
 * @returns A promise that resolves with the model's response.
 */
export interface BaseVector {
  addDocument(collectionName: string, text: string): Promise<any>;
  generate(modelName: string, indexName: string, query: string): Promise<any>;
  makeCallToModel(modelName: string, context: string, query: string): Promise<any>;
}
