# Managed memory investigation — November 9, 2026

## Verified observations

- The core live demo works through Vercel: model calls, catalog functions, database receipts, and tracer readback.
- The hotel cluster is healthy on Couchbase 8.0.3, AWS us-east-1, with Data, Query, Index, and Search services.
- The dedicated harborline-memory-demo bucket exists. Its 100 MiB Magma/128-vBucket configuration meets the documented storage-engine minimum. It has no agentmemory scope yet, so memory initialization has not completed.
- Replacement memory deployment d8e4ab0a-6133-46ad-8616-7925998c38df was accepted at 2026-11-09T23:57:25Z. It still reported deploying during this investigation.
- A project event confirms Capella created its database credential at 23:57:28Z. The fetched events expose no subsequent memory-specific failure reason.
- The service credential is scoped read/write to the dedicated bucket. It has not been manually changed.
- Before any allowed-IP rule is added, the memory gateway health URL returns an HTML 403. That response does not establish backend model or database health.
- Direct independent tests using the user-provided OpenAI key returned HTTP 401 / invalid_api_key for both text-embedding-3-small and gpt-4.1-nano. The test used the full saved key with no embedded whitespace. See provider-dependency-check.json; no key is included.

## Conclusion and uncertainty

The submitted provider key is not accepted by OpenAI and must be replaced before it can support memory. Capella masks the stored integration key, so this test does not independently prove its stored credential is identical. An invalid dependency is a concrete finding; the exact cause of the prolonged Capella provisioning state remains unconfirmed without service diagnostics.

## Next steps

1. Validate a replacement company-approved key against both configured models using tiny requests.
2. Have the user update johnharborlinedemo in Capella with the validated credential, preserving its integration ID.
3. Check whether provisioning finishes. If not, ask Couchbase to inspect the deployment worker, service startup logs, gateway version, and integration/model errors for the deployment ID above. Do not repeatedly recreate services without evidence.
4. Once healthy, configure deployment-scoped Write access and the approved hosted network strategy; store the memory credential only in encrypted Vercel configuration.
5. Redeploy, then verify memory write/readback and semantic recall through the actual hosted runtime. Database receipts alone do not prove managed-memory integration.

## Primary references

- [Managed deployment prerequisites and connection rules](https://docs.couchbase.com/agent-mem/current/managed/deploy-agent-mem-managed.html)
- [Health and diagnostic log API](https://docs.couchbase.com/agent-mem/current/agent-memory-api-reference/rest-api.html)
- [Management API: deployment status and project events](https://docs.couchbase.com/cloud/management-api-reference/index.html)
- [Magma bucket minimum](https://docs.couchbase.com/server/current/manage/manage-buckets/create-bucket.html)
- [OpenAI API error codes](https://developers.openai.com/api/docs/guides/error-codes)
