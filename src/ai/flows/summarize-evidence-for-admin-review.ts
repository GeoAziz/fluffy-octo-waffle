'use server';

/**
 * @fileOverview Summarizes evidence documents for admin review.
 *
 * - summarizeEvidence - A function that summarizes the provided evidence document.
 * - SummarizeEvidenceInput - The input type for the summarizeEvidence function.
 * - SummarizeEvidenceOutput - The return type for the summarizeEvidence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeEvidenceInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the evidence document to summarize.'),
});
export type SummarizeEvidenceInput = z.infer<typeof SummarizeEvidenceInputSchema>;

const SummarizeEvidenceOutputSchema = z.object({
  summary: z
    .string()
    .describe('A brief, factual summary of the evidence document.'),
});
export type SummarizeEvidenceOutput = z.infer<typeof SummarizeEvidenceOutputSchema>;

export async function summarizeEvidence(
  input: SummarizeEvidenceInput
): Promise<SummarizeEvidenceOutput> {
  return summarizeEvidenceFlow(input);
}

const summarizeEvidencePrompt = ai.definePrompt({
  name: 'summarizeEvidencePrompt',
  input: {schema: SummarizeEvidenceInputSchema},
  output: {schema: SummarizeEvidenceOutputSchema},
  prompt: `You are an AI assistant helping admins quickly understand evidence documents.
  Summarize the following document in a brief, factual manner, highlighting key information relevant to land trust and property verification:

  Document:
  {{documentText}}`,
});

const summarizeEvidenceFlow = ai.defineFlow(
  {
    name: 'summarizeEvidenceFlow',
    inputSchema: SummarizeEvidenceInputSchema,
    outputSchema: SummarizeEvidenceOutputSchema,
  },
  async input => {
    const {output} = await summarizeEvidencePrompt(input);
    return output!;
  }
);
