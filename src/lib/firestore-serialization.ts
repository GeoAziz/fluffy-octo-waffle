/**
 * Firestore Timestamp Serialization Utility
 * 
 * Converts Firestore Timestamp objects to ISO strings for safe
 * passage from server components to client components in Next.js 15+
 */

/**
 * Check if a value is a Firestore Timestamp object
 */
export const isFirestoreTimestamp = (value: unknown): boolean => {
  return (
    value !== null &&
    typeof value === 'object' &&
    '_seconds' in value &&
    '_nanoseconds' in value
  );
};

type FirestoreTimestampLike = {
  _seconds: number;
  _nanoseconds: number;
};

const asTimestamp = (value: unknown): FirestoreTimestampLike | null => {
  if (!isFirestoreTimestamp(value)) return null;
  const candidate = value as { _seconds?: unknown; _nanoseconds?: unknown };
  if (typeof candidate._seconds !== 'number' || typeof candidate._nanoseconds !== 'number') {
    return null;
  }
  return { _seconds: candidate._seconds, _nanoseconds: candidate._nanoseconds };
};

/**
 * Convert a single Firestore Timestamp to ISO string
 */
export const serializeTimestamp = (timestamp: unknown): string | null => {
  const parsedTimestamp = asTimestamp(timestamp);
  if (!parsedTimestamp) {
    return null;
  }
  try {
    const milliseconds = parsedTimestamp._seconds * 1000 + Math.round(parsedTimestamp._nanoseconds / 1000000);
    return new Date(milliseconds).toISOString();
  } catch (e) {
    console.error('Failed to serialize timestamp:', e);
    return null;
  }
};

/**
 * Deep clone and serialize all Firestore Timestamps in an object
 */
export const serializeDocument = <T>(doc: T): T => {
  if (!doc || typeof doc !== 'object') {
    return doc;
  }

  if (isFirestoreTimestamp(doc)) {
    return serializeTimestamp(doc) as T;
  }

  if (Array.isArray(doc)) {
    return doc.map(item => serializeDocument(item)) as T;
  }

  const serialized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc)) {
    if (isFirestoreTimestamp(value)) {
      serialized[key] = serializeTimestamp(value);
    } else if (value && typeof value === 'object') {
      serialized[key] = serializeDocument(value);
    } else {
      serialized[key] = value;
    }
  }

  return serialized as T;
};

/**
 * Serialize an array of documents
 */
export const serializeDocuments = <T extends Record<string, unknown>>(docs: T[]): T[] => {
  return docs.map(doc => serializeDocument(doc));
};
