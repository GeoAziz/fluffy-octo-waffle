import { config } from 'dotenv';
config();

import '@/ai/flows/flag-suspicious-upload-patterns.ts';
import '@/ai/flows/summarize-evidence-for-admin-review.ts';
import '@/ai/flows/extract-text-from-image.ts';
