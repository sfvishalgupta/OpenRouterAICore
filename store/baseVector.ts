export interface BaseVector {
  addDocument(collectionName: string, text: string): Promise<any>;
  generate(modelName: string, indexName: string, query: string): Promise<any>;
}
