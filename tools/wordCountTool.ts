import { DynamicTool } from 'langchain/tools';

export const WordCountTool = new DynamicTool({
  name: 'word-count',
  description: 'Counts the number of words in a given text string.',
  func: async (input: string) => {
    const wordCount = input.trim().split(/\s+/).length;
    return `The input contains ${wordCount} words.`;
  },
});
