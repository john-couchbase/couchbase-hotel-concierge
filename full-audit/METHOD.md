# Audit method and evidence boundaries

**Review date:** November 5, 2026. **Purpose:** prioritize AI Data Plane technical marketing and developer-experience work. **Audience:** marketing leadership, Docs, SDK/DevRel, PM and performance engineering.

## Coverage

This is a full-scope marketing/developer-journey review across the component families listed in CAPABILITIES.md. It is not an exhaustive line-by-line code audit, a full website/video census, a penetration test or a completed production validation program.

1. Reused earlier source assessments and retained native lab evidence, preserving their original scope and date.
2. Retrieved the official AI Data Plane documentation index and all 71 unique linked pages. Recorded HTTP status, content hash, headings and code-block counts. All 71 returned 200. Detailed reading focused on entry points, feature boundaries, costs, customization, operations and the findings cited in the register.
3. Retrieved operational SDK overview/vector guides for ten language entry points. Reviewed nine Markdown vector guides; Kotlin HTML was available after its Markdown URL returned 403.
4. Fetched current registry metadata and wheels for seven Python distributions. Verified wheel SHA-256 against the registry and inspected class/method definitions without executing downloaded project scripts. No third-party wheel or full source snapshot is republished here.
5. Reused the November 5 Catalog/Memory interface check; installed/imported LangChain 1.2.0 in an isolated environment. Ran dependency resolution for the pinned LangChain/MCP pair, without a service deployment.
6. Executed four LangChain contract cases with a mocked database and six Memory validation cases with mocked HTTP. These demonstrate client request/validation behavior only. They do not measure live results, extraction quality, authorization or latency.
7. Parsed Python snippets. The two complete Query examples have unclosed calls. The raw result also includes an intentionally incomplete signature and a Catalog template with replacement markers; those are **not** counted as broken runnable examples.
8. Refreshed twelve selected YouTube metadata/description records. Used the prior 30-card channel sample for broader topic context. No claim of watching all videos or reviewing private analytics.
9. Assessed selected articles, demos, claims and benchmarks against the reader journey: understand → choose → run → adapt → measure → operate. Existing assets are explicitly marked for reuse.

The current source snapshot is larger than the 64-source curated citation register because it includes language variants, indexed API references and failed discovery attempts. Counts are not a quality score. A URL returning 200 does not establish that its example works.

## Evidence labels

- **Prior live lab:** actual Couchbase operation from the retained November 3–4 runs, with scope and limitations.
- **Offline reproduced:** import, parsing, dependency or method behavior demonstrated without the service.
- **Static source inspection:** code or request construction reviewed, not a live end-to-end outcome.
- **Documented boundary:** a primary reference states the requirement or limitation.
- **Content assessment:** a judgment about clarity, discoverability or missing proof within the reviewed sample.
- **User report:** reported incident; no independently retained engineering record yet.

A proposal for a new guide is not a product defect. A missing reference in our sample is not proof that a capability or asset does not exist. Failure to fetch a guessed URL is not proof that the official navigation is broken.

## Reproduce the offline cases

Use Python 3.12 and isolated environments. From the repository root, create `outputs/full-audit` before running the scripts. Install `langchain-couchbase==1.2.0` for `full-audit/evidence/adapter_probe.py`; install `couchbase-agent-memory==1.1.0` separately for `full-audit/evidence/memory_probe.py`. Each script writes sanitized JSON under `outputs/full-audit`.

The adapter probe bypasses constructors and supplies a mock scope, then calls the actual public search method. It tests generated query/filter behavior, not connection setup. The Memory probe constructs a session resource with a mock HTTP client; the two successful paths stop at that mock.

To reproduce the dependency conflict, resolve the two requirements together:

```text
langchain-couchbase==1.2.0
couchbase-mcp-server==1.1.0
```

The captured resolver output names the incompatible `reo-census` ranges. Do not force-install incompatible dependencies to make the example appear to work. Separate processes are a valid deployment arrangement.

For source checks, use the URLs/hashes in `evidence/source-manifest.json` and `document-inventory.json`. Current docs may change after the review. The package interface inventories include the inspected wheel hashes. Re-fetching a newer version is a new audit observation, not a reproduction of the pinned result.

## Limits and remaining validation

| Remaining work | Why it is not claimed complete | What would close it |
|---|---|---|
| Managed Memory quality and economics | No approved integration was exercised against a deployed memory service | Company-approved connection, priced deployment, baseline experiment and raw results |
| All-language SDK execution | Documentation reviewed; no Java/.NET/Go/etc. build and service matrix run | Version-pinned compile and integration jobs on supported platforms |
| Full Catalog workflow | Entry-point failures and lower-level logger evidence only | Init, index, publish, discovery, version changes and UI verification |
| Hosted model / managed MCP / workflow / cache / guardrail behavior | Package/docs review does not exercise paid services | Bounded service tests after dependency and cost checks |
| Production performance and security | Synthetic/small learning workloads; no adversarial or failover campaign | Environment-matched benchmark and specialist review |
| Complete media/site coverage | Public sample; no full playback or private content inventory | Content-owner inventory, selected full-video review and internal analytics |
| Financial reconciliation | Prior invoice access was unavailable | Billing-owner confirmation of cumulative charges and retained resources |
| Sign-out incident | User reports engineering confirmation | Incident ID, exact model, affected version and verified workaround |

No cluster resume, paid deployment or model call was performed in this audit. Public downloads and local package probes do not establish a total historical bill below $30. Existing storage/resources may continue to incur charges; no new resource was created here.

## Publication hygiene

Only authored summaries, citations, inventories, sanitized probe results and small reproduction scripts are included. Credentials, API tokens, private account configuration, downloaded wheels and full copied articles are excluded. Proposed owner labels are not team assignments. No engineers, customers or channel members were messaged.
