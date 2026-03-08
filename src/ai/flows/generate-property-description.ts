'use server';
/**
 * @fileOverview A Genkit flow to generate a property description from bullet points.
 *
 * - generateDescriptionFromPoints - A function that creates a description.
 * - GenerateDescriptionInput - The input type for the function.
 * - GenerateDescriptionOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDescriptionInputSchema = z.object({
  bulletPoints: z.string().describe('A list of key features or bullet points about the property.'),
});
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

const GenerateDescriptionOutputSchema = z.object({
  description: z.string().describe('A well-written, appealing property description based on the bullet points.'),
});
export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;

export async function generatePropertyDescription(
  input: GenerateDescriptionInput
): Promise<GenerateDescriptionOutput> {
  return generatePropertyDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePropertyDescriptionPrompt',
  input: {schema: GenerateDescriptionInputSchema},
  output: {schema: GenerateDescriptionOutputSchema},
  prompt: `You are a real estate marketing expert. Your task is to write a compelling and professional property description based on the provided bullet points. The tone should be inviting but professional.

Key Features:
{{{bulletPoints}}}

Generate a full description based on these points.`,
});

const generatePropertyDescriptionFlow = ai.defineFlow(
  {
    name: 'generatePropertyDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
