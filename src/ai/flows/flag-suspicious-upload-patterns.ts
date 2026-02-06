'use server';
/**
 * @fileOverview This file contains a Genkit flow for flagging suspicious patterns in uploaded documents.
 *
 * The flow takes in a list of document descriptions and flags the upload as suspicious if it detects any potentially fraudulent patterns.
 *
 * @exports {function} flagSuspiciousUploadPatterns - The main function to trigger the suspicious pattern detection flow.
 * @exports {type} FlagSuspiciousUploadPatternsInput - The input type for the flagSuspiciousUploadPatterns function.
 * @exports {type} FlagSuspiciousUploadPatternsOutput - The output type for the flagSuspiciousUploadPatterns function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FlagSuspiciousUploadPatternsInputSchema = z.object({
  documentDescriptions: z
    .array(z.string())
    .describe('A list of descriptions for each uploaded document.'),
});
export type FlagSuspiciousUploadPatternsInput = z.infer<typeof FlagSuspiciousUploadPatternsInputSchema>;

const FlagSuspiciousUploadPatternsOutputSchema = z.object({
  isSuspicious: z
    .boolean()
    .describe('Whether or not the uploaded documents are flagged as suspicious.'),
  reason: z
    .string()
    .optional()
    .describe('The reason for flagging the upload as suspicious.'),
});
export type FlagSuspiciousUploadPatternsOutput = z.infer<typeof FlagSuspiciousUploadPatternsOutputSchema>;

export async function flagSuspiciousUploadPatterns(
  input: FlagSuspiciousUploadPatternsInput
): Promise<FlagSuspiciousUploadPatternsOutput> {
  return flagSuspiciousUploadPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'flagSuspiciousUploadPatternsPrompt',
  input: {schema: FlagSuspiciousUploadPatternsInputSchema},
  output: {schema: FlagSuspiciousUploadPatternsOutputSchema},
  prompt: `You are an AI assistant that analyzes uploaded documents for potential fraud. You will be provided with a list of descriptions for each document uploaded by a user. Your task is to determine if there are any suspicious patterns in these documents that might indicate fraudulent activity. Return true if the upload is suspicious, and false otherwise.

Document Descriptions:
{{#each documentDescriptions}}- {{{this}}}
{{/each}}

Consider the following:
- Inconsistencies between documents
- Missing information
- Unusual patterns or anomalies
- Contradictory statements
- Use of generic or boilerplate language
- Altered signatures or stamps

Based on your analysis, determine if the upload is suspicious and provide a reason for your determination.

Please provide your output in JSON format.
`,
});

const flagSuspiciousUploadPatternsFlow = ai.defineFlow(
  {
    name: 'flagSuspiciousUploadPatternsFlow',
    inputSchema: FlagSuspiciousUploadPatternsInputSchema,
    outputSchema: FlagSuspiciousUploadPatternsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
