# Cost Controls

## Firestore Read Optimization

Implemented:
- Listing query now applies filter pushdown (`status`, `county`, `landType`, price and area ranges) before fetch.
- Pagination was hardened to avoid empty pages when post-filtering removes records.
- Seller validation is memoized per query execution to reduce repeated reads.
- Search uses denormalized token fields (`searchText`, `searchTokens`) generated at write time.

## Storage Lifecycle Policy (Post-launch)

Recommended GCS lifecycle policy for evidence buckets:
- Transition to Nearline after 90 days
- Transition to Coldline after 365 days
- Delete evidence files after retention window (for example 1825 days)

Example lifecycle rule:

```json
{
  "rule": [
    { "action": { "type": "SetStorageClass", "storageClass": "NEARLINE" }, "condition": { "age": 90 } },
    { "action": { "type": "SetStorageClass", "storageClass": "COLDLINE" }, "condition": { "age": 365 } },
    { "action": { "type": "Delete" }, "condition": { "age": 1825 } }
  ]
}
```

Apply with `gsutil lifecycle set lifecycle.json gs://<bucket-name>` in infrastructure workflows.

## AI Quota & Fallback

Implemented guardrails:
- Daily AI quota counter in `ops/ai-quota-YYYY-MM-DD`
- Quota is consumed per flow invocation
- On quota exhaustion, fallback behavior is used:
  - image analysis: neutral manual-review signal
  - trust badge suggestion: safe fallback badge (`EvidenceSubmitted`) with rationale

## Search Index Evolution

Current state:
- Firestore-backed search with denormalized write-time search tokens.

Scale path:
- Keep Firestore for baseline discovery.
- Add dedicated search service (Algolia/Meilisearch/Typesense) when query complexity or response time requires advanced indexing.
