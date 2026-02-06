'use server';
/**
 * @fileOverview This file contains a Genkit flow for suggesting a trust badge for a listing based on its evidence.
 *
 * @exports {function} suggestTrustBadge - The main function to trigger the badge suggestion flow.
 * @exports {type} SuggestTrustBadgeInput - The input type for the function.
 * - @exports {type} SuggestTrustBadgeOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrustBadgeInputSchema = z.object({
  listingTitle: z.string().describe('The title of the property listing.'),
  evidenceContent: z
    .array(z.string())
    .describe('A list of text content extracted from each piece of evidence provided by the seller.'),
});
export type SuggestTrustBadgeInput = z.infer<typeof SuggestTrustBadgeInputSchema>;

const SuggestTrustBadgeOutputSchema = z.object({
  badge: z.enum(['Gold', 'Silver', 'Bronze', 'None']).describe('The suggested trust badge based on the quality and completeness of the evidence.'),
  reason: z
    .string()
    .describe('The reasoning for the suggested badge.'),
});
export type SuggestTrustBadgeOutput = z.infer<typeof SuggestTrustBadgeOutputSchema>;

export async function suggestTrustBadge(
  input: SuggestTrustBadgeInput
): Promise<SuggestTrustBadgeOutput> {
  return suggestTrustBadgeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTrustBadgePrompt',
  input: {schema: SuggestTrustBadgeInputSchema},
  output: {schema: SuggestTrustBadgeOutputSchema},
  prompt: `You are an AI assistant for a land marketplace, responsible for helping admins assign trust badges to listings. Your task is to analyze the provided evidence for a listing and suggest a badge: "Gold", "Silver", "Bronze", or "None".

- **Gold:** All key documents (like title deed, survey map) are present, clear, and consistent. Information seems complete.
- **Silver:** Most key documents are present, but some minor information might be missing or slightly inconsistent.
- **Bronze:** Some evidence is provided, but key documents are missing or have significant inconsistencies.
- **None:** Very little or no credible evidence is provided.

Listing Title: {{{listingTitle}}}

Evidence Content (from OCR):
{{#each evidenceContent}}
- {{{this}}}
{{/each}}

Based on the content, suggest a badge and provide a brief, clear justification for your choice.`,
});

const suggestTrustBadgeFlow = ai.defineFlow(
  {
    name: 'suggestTrustBadgeFlow',
    inputSchema: SuggestTrustBadgeInputSchema,
    outputSchema: SuggestTrustBadgeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
