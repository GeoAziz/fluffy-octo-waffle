'use server';
/**
 * @fileOverview A Genkit flow to analyze a property image for authenticity.
 *
 * - analyzePropertyImage - A function that checks if an image is real or suspicious.
 * - AnalyzePropertyImageInput - The input type for the function.
 * - AnalyzePropertyImageOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePropertyImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a property as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePropertyImageInput = z.infer<typeof AnalyzePropertyImageInputSchema>;

const AnalyzePropertyImageOutputSchema = z.object({
  isSuspicious: z.boolean().describe('True if the image is likely a stock photo, AI-generated, or otherwise misleading.'),
  reason: z.string().describe('A brief explanation for why the image is or is not considered suspicious.'),
});
export type AnalyzePropertyImageOutput = z.infer<typeof AnalyzePropertyImageOutputSchema>;

export async function analyzePropertyImage(
  input: AnalyzePropertyImageInput
): Promise<AnalyzePropertyImageOutput> {
  return analyzePropertyImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePropertyImagePrompt',
  input: {schema: AnalyzePropertyImageInputSchema},
  output: {schema: AnalyzePropertyImageOutputSchema},
  prompt: `You are an expert image analyst for a real estate platform. Your job is to determine if the provided image of a property is authentic or potentially misleading.

Check for the following signs:
- Is it a generic stock photo?
- Does it look like a computer-generated rendering or AI-generated image?
- Are there watermarks or other signs it's not an original photo of the property?

Analyze the image and determine if it is suspicious. Provide a clear reason for your conclusion.

Image: {{media url=imageDataUri}}`,
});

const analyzePropertyImageFlow = ai.defineFlow(
  {
    name: 'analyzePropertyImageFlow',
    inputSchema: AnalyzePropertyImageInputSchema,
    outputSchema: AnalyzePropertyImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
