import { DynamicTool } from 'langchain/tools';

export const debugTool = new DynamicTool({
  name: 'debug-tool',
  description:
    "Use this tool when asked to process text through the debug-tool. It converts input to uppercase and returns it prefixed with 'Processed:'. Always use sync function calls with this tool.",
  func: async (input: string) => {
    // Simulate processing
    const output = `Processed: ${input.toUpperCase()}`;
    return output;
  },
});
