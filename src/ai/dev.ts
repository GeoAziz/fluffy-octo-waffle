import { config } from 'dotenv';
config();

import '@/ai/flows/flag-suspicious-upload-patterns.ts';
import '@/ai/flows/summarize-evidence-for-admin-review.ts';
import '@/ai/flows/extract-text-from-image.ts';
import '@/ai/flows/generate-property-description.ts';
import '@/ai/flows/analyze-property-image.ts';
import '@/ai/flows/suggest-trust-badge.ts';
