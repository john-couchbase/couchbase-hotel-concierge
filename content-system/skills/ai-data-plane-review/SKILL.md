---
name: ai-data-plane-review
description: Use when reviewing a Couchbase AI Data Plane article, tutorial, benchmark write-up, or demo script for technical accuracy and publication readiness.
---

# AI Data Plane review

Review the supplied artifact against its reader task and evidence. Do not rewrite unrelated material or treat a preferred style as a product defect.

Read `content-system/README.md` if available for metadata and the PR checklist. Inspect the referenced code and current primary sources when accessible. If a source or test is unavailable, state the limit rather than approving the claim by assumption.

## Review in this order

1. **Claims:** Can each material capability, security, cost or comparison claim be traced to evidence? Separate documented behavior, measured results, inference and proposed work.
2. **Execution:** Are prerequisites, versions, credentials, deployment mode, complete code and expected outputs sufficient? A snippet import check is not an end-to-end test. Record exactly what was executed.
3. **Boundaries:** Does the article distinguish application logic from managed services? Check optional MCP/memory, tool execution ownership, source-of-truth checks and strict filter scope.
4. **Trade-offs:** Are failure cases, stale data, correction behavior, cost units and cleanup explicit? For memory check baseline alternatives, user isolation and retention limits. For benchmarks check fair baselines, held-out data, reproducibility and full-cost accounting.
5. **Reader journey:** Is the outcome clear, terminology explained, video paired with a written path, and the next action useful? Verify links, image descriptions, ownership and freshness metadata.

## Report

Return a short verdict: ready for human review, needs revision, or blocked on evidence. List findings by impact with article location, evidence, concrete correction and acceptance check. Distinguish publication blockers from editorial suggestions. Do not invent approval from a named PM or reviewer.

Example: “Needs revision: the article calls a 35% prompt-token reduction a 35% total-cost saving. Show extraction, embedding, retrieval and infrastructure costs or narrow the claim to measured prompt tokens.”

Review is not permission to merge or publish. Do not run paid code or live mutations unless already authorized. If no blockers are found, report checks performed and remaining coverage limits; do not imply a security audit or production certification.
