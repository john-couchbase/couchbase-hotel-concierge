# AI Data Plane marketing priorities

Updated November 5, 2026 after the expanded SDK and content audit.

Start with the [leadership audit](full-audit/README.md). The [45-finding register](full-audit/FINDINGS.md) separates reproduced problems, documented boundaries and content opportunities.

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


[Content review and proposed recordings](full-audit/CONTENT-REVIEW.md) · [Benchmark and proof plan](full-audit/PROOF-PLAN.md) · [SDK coverage](full-audit/CAPABILITIES.md) · [Standardized templates and skills](content-system/README.md)

The earlier November 4 roadmap is superseded by this order. Existing Memory, Ragas, Tracer and framework guides should be reused; current tutorial defects should be repaired before recording. No new live paid tests were run for this audit.
