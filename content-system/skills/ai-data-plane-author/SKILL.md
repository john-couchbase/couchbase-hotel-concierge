---
name: ai-data-plane-author
description: Use when drafting or revising Couchbase AI Data Plane quickstarts, technical guides, benchmark articles, or written companions to demos.
---

# AI Data Plane author

Create an article that lets a defined reader complete a task or make a supported decision. Preserve the user's chosen format and scope.

## Select the format

Use the repository's `content-system/templates/`: quickstart for first success, use-case-guide for choosing/configuring an approach, benchmark for measured comparisons, demo-companion for a recorded walkthrough. Read `content-system/README.md` for metadata and review conventions. If these files are unavailable, ask for their location or use the equivalent structure below; do not pretend a template was loaded.

For a quickstart cover prerequisites, exact versioned code, expected output, one failure and cleanup. For a guide compare alternatives and show an adaptable recipe. For a benchmark require a reproduction manifest, fair baselines, raw results and limitations. For a demo identify observable proof and provide a written runnable path.

## Build from evidence

Use current primary documentation for feature and deployment claims. Distinguish documented, locally observed, hypothetical and unknown behavior. Never turn a product headline into a universal guarantee or a planned experiment into a result.

Identify required versus optional components and separate model, framework, tool execution, database, MCP, memory and tracing responsibilities. Include provider/plan/region requirements and all relevant cost units. Do not assume serverless and provisioned have identical capabilities.

Memory guidance must distinguish conversation context, stored profiles, authoritative records and cross-session recall. Explain what varies by use case: identity/scope, ingestion, retrieval, corrections, temporary overrides, freshness, retention and fallback. Label each control as service-owned or application-owned only when supported by evidence.

Search guidance must identify index family, embedding model and mandatory filters. Benchmark guidance must separate quality, tokens, calls and total cost and report losses alongside wins.

## Deliver

Write plain prose around one outcome. Link the tested code revision and next action. Keep verification dates empty and evidence status honest when execution has not happened. Preserve draft status until reviews are recorded. Return the draft plus a short list of unresolved factual questions and required tests.

Do not deploy resources, use another person's keys, spend money or publish merely because this skill is invoked. Follow the user's existing authorization for those actions.
