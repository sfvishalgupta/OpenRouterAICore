// import {BaseVector} from './baseVector';
// import { FakeEmbeddings } from "langchain/embeddings/fake";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";

// export class MemoryVector implements BaseVector {
//     storeData(docs: any, collectionName: string): any {
//         return {};
//     }

//     getEmbeddings(): any {
//         return new FakeEmbeddings({});
//     }

//     getStoreFromTexts(texts: string[], metadatas: any, collectionName: string): Promise<any> {
//         throw new Error('Method not implemented.');
//     }
//     getClient(): any {
//         throw new Error('Method not implemented.');
//     }

//     async getStoreFromDocument(docs: any): Promise<MemoryVectorStore> {
//         return await MemoryVectorStore.fromDocuments(
//             docs, this.getEmbeddings()
//         );
//     }
// }
