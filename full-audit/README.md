# AI Data Plane audit: what to fix, reuse and prove

**Prepared for John Kupchanko and marketing leadership · November 5, 2026**

**The main opportunity is to make the first working experience dependable, then show evidence for the benefits.** Couchbase already has extensive component documentation, framework integrations, demonstrations and evaluation material. The biggest gaps are broken or misleading examples, unclear choices between components, and performance claims that are difficult for an evaluator to reproduce.

This audit records **45 findings, not 45 product bugs**. They include reproduced problems, documented limitations, content improvements and questions that still need engineering confirmation. Each has evidence, a proposed owner and a completion check in the [findings register](FINDINGS.md). Use the [CSV](findings.csv) to assign owners and track decisions.

## What leadership should know

| Finding | What it means for marketing | Evidence |
|---|---|---|
| Some starting examples fail or teach the wrong operation | Fix the examples before driving more traffic to them | Catalog APIs do not match package 1.1.5; two Python snippets fail parsing; nine SDK guides label an ID lookup as a Hyperscale search example. G01, G31–32 |
| Filters do not transfer unchanged between retrieval adapters | A clear adapter-selection guide needs runnable negative tests | Offline LangChain 1.2.0 probe: a Search-style filter passed to the Query adapter is silently omitted. G33 |
| Memory has substantial documentation already | Build a decision guide and measurable recipes; do not commission another generic reference | Managed/self-managed quickstarts, prompt customization, update APIs, access controls and metrics exist. G09, G35 |
| “Works together” still requires deployment and credential choices | Explain the minimum architecture for each task | Model, Memory, MCP and database credentials serve different purposes; deployment support varies. G07, G11, G17, G39 |
| Governance is several observable mechanisms | Demonstrate the limits as well as the controls | Catalog tracing and MCP auditing have different setup; recording does not guarantee delivery, redaction or correct decisions. G10, G38, G41 |
| Strong cost and scale claims need a reusable evidence package | Prioritize benchmarks with fair baselines and full costs | Public studies exist; our lab has not reproduced managed-memory savings or production-scale claims. G08, G18 |

These are reasons to improve the evaluation journey, not evidence that the platform lacks value. The prior database, lexical and vector labs demonstrated useful functionality. Their failures and limitations are retained in the [capability review](CAPABILITIES.md).

## The ten priorities

Order reflects first-run blockers, reach across audiences, strength of evidence and dependencies. It is a proposed sequence, not an estimated revenue ranking. Owners and effort need team agreement.

| Order | Focus and affected reader | Article or guide | Video and runnable proof | Proposed lead / completion check |
|---|---|---|---|---|
| **1** | Repair the first run — developers | Correct Catalog APIs, Python syntax and actual ANN examples | Record only after a clean setup works | **Docs + SDK owners:** pinned examples run; expected results retained. G01, G31–32, G35 |
| **2** | Start here — new evaluators | “Which pieces do I need?” Three paths: retrieve data, connect an agent, add memory. Include keys, regions, support and cost units | Follow one request from question to verified record; show optional components | **Technical Marketing + DevRel:** a new reader finishes a verified first query and cleanup. G07, G17, G26, G36 |
| **3** | Search choices and strict filters — retrieval developers | Lexical, dense and hybrid; Search vs Composite vs Hyperscale; exact filter syntax per adapter | Same queries, same data, all three modes; show a filter that must never be violated | **Search DevRel + integration owners:** labeled expected results and negative fixtures. G02, G15–16, G33–34 |
| **4** | Why operational data matters — app developers and architects | KV vs SQL++ vs search, with current business records | An order or support assistant uses an exact record and policy retrieval; a changed record changes the answer | **DevRel + Technical Marketing:** observable tool arguments, sources and freshness. G30 |
| **5** | When memory helps — agent developers | Decision guide plus support and personalization recipes; reuse existing reference docs | Same person across sessions, permanent correction, temporary exception and deletion | **Memory PM + DevRel:** distinguish native controls from app logic and show no-memory/profile baselines. G09, G11, G35 |
| **6** | Prove memory economics — architects and buyers | A reproducible usefulness-and-total-cost study | One workload where memory helps and one where it does not | **Performance Engineering + Memory PM:** quality, extraction cost, infrastructure, latency and stale recall reported. G08–09 |
| **7** | Make SDK choices predictable — developers and platform teams | One matrix for package, language, index, support route and tested version; isolated MCP/app environments | Switch adapters without losing filters; show least-privilege initialization | **SDK/partner owners:** locked environments and explicit compatibility checks. G33–37, G39 |
| **8** | Explain governance in practice — platform/security reviewers | MCP permissions, Catalog versions, Tracer and audit logging; who records what | A tool change, a denied operation, a trace lookup and a failed log write | **MCP/Catalog owners + Technical Marketing:** visible coverage and delivery limitations. G10, G38, G41 |
| **9** | Show operations after day one — production evaluators | Model modes, vectorization updates/deletes, credential rotation, cache and bounded AI Functions | Update a source, change a model, recover a failed workflow; show a wrong cache hit | **AI Services PM + DevRel:** freshness and recovery acceptance tests, charges included. G06, G24–25, G27, G42 |
| **10** | Maintain a repeatable content system — all contributors | Apply the existing templates and author/reviewer skills to every package | Each video links to the same tested code revision and article | **Technical Marketing + Docs tooling:** owner, tested date, version, review checklist and automated sample checks. G12–13, G45 |

Priority 10 is an enabling workstream to start alongside priority 1, not a reason to postpone the content system. Edge and Operational Insights deserve segment-specific demos after the core journey; their deployment boundaries are already in this audit.

## What we should reuse

- **Memory quickstarts and developer guides:** extend them with use-case choices and outcomes, rather than rewrite their APIs.
- **Ragas tutorial and vector benchmark methodology:** build a shared evaluation harness on those foundations.
- **Hands-on lab, framework retrieval samples and SQL/JSON material:** connect them through one small operational use case.
- **Existing architecture videos and customer stories:** use them for awareness, then link to current task-specific walkthroughs.
- **Tools/Prompts Hub and Tracer guides:** turn the existing capabilities into a reproducible governance story.

The [content review](CONTENT-REVIEW.md) explains what each asset already does and what to add. “Not found” means not found in this bounded public review, not that no team has ever produced it.

## Audit scope and confidence

The review covers the core AI Data Plane journey plus operational data, search, framework integrations, Operational Insights and edge boundaries. It combines the November 3–4 native labs with a November 5 documentation, package and content audit.

- Inventoried **all 71 unique pages linked by the official AI Data Plane documentation index**; each returned HTTP 200. Inventory and heading checks are broader than detailed line-by-line review.
- Compared **ten operational SDK entry points**. Nine vector guides were readable in Markdown; Kotlin was checked through HTML after the Markdown request failed. No claim of executing all language SDKs.
- Inspected metadata and Python interfaces from **seven versioned distributions**; imported LangChain separately; ran a dependency resolver and **ten offline adapter/Memory validation cases**. Spies replaced database/HTTP calls.
- Refreshed **12 selected video descriptions/metadata records**, alongside the earlier 30 visible channel cards. Videos were not watched end to end; this is a topic, freshness and navigation review, not a production-quality score.
- Reviewed selected technical articles, repositories, benchmark publications, customer evidence and prior lab reports. This is not a census of every company webpage or private enablement asset.

**Not established:** live managed-memory usefulness/cost; complete Catalog publishing; hosted-model generation/tool-selection accuracy; managed MCP deployment; cache/guardrail effectiveness; workflow recovery; all-language runtime parity; production failover or scale. This is a marketing and developer-experience audit, not a security certification or proof of production readiness.

No paid model call, cluster resume or paid deployment was made for this audit. The $30 cumulative cap remains in force; the historical invoice total and ongoing retained-resource charges have not been reconciled. See [method and evidence](METHOD.md).

## Decisions to take to the meeting

1. Approve the three initial packages: repaired starting path, search/filter guide, and memory decision/demo package.
2. Name Docs/SDK partners for the reproduced issues before recording new walkthroughs.
3. Assign an owner for the memory benchmark evidence and approve its separate costed test plan.
4. Adopt the content checklist and assign one accountable owner per package.
5. Measure successful first runs and completed evaluations before setting numeric funnel targets.

[Detailed findings](FINDINGS.md) · [Capabilities and SDKs](CAPABILITIES.md) · [Content review](CONTENT-REVIEW.md) · [Proof and benchmark plan](PROOF-PLAN.md) · [Evidence method](METHOD.md)
