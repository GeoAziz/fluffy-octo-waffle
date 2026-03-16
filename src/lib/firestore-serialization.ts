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

/**
 * Convert a single Firestore Timestamp to ISO string
 */
export const serializeTimestamp = (timestamp: any): string | null => {
  if (!isFirestoreTimestamp(timestamp)) {
    return null;
  }
  try {
    const milliseconds = timestamp._seconds * 1000 + Math.round(timestamp._nanoseconds / 1000000);
    return new Date(milliseconds).toISOString();
  } catch (e) {
    console.error('Failed to serialize timestamp:', e);
    return null;
  }
};

/**
 * Deep clone and serialize all Firestore Timestamps in an object
 */
export const serializeDocument = <T extends Record<string, any>>(doc: T): T => {
  if (!doc || typeof doc !== 'object') {
    return doc;
  }

  if (isFirestoreTimestamp(doc)) {
    return serializeTimestamp(doc) as any;
  }

  if (Array.isArray(doc)) {
    return doc.map(item => serializeDocument(item)) as any;
  }

  const serialized: any = {};
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
export const serializeDocuments = <T extends Record<string, any>>(docs: T[]): T[] => {
  return docs.map(doc => serializeDocument(doc));
};
