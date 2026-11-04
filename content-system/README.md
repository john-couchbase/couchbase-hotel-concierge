# AI Data Plane content system

A repository-managed authoring kit: templates, reusable skills and a review workflow. This is an internal learning-repository standard, not an approved corporate editorial policy or a new public website.

## Start an article

1. Choose a template: [quickstart](templates/quickstart.md), [use-case guide](templates/use-case-guide.md), [benchmark](templates/benchmark.md) or [demo companion](templates/demo-companion.md).
2. Copy it to `articles/<slug>/index.md` in your working checkout. Put article-specific images beside it and keep runnable code in a linked sample directory with a pinned revision.
3. Fill the metadata and remove authoring prompts. Keep `draft: true` until the technical and editorial reviews are recorded.
4. Use the authoring skill for drafting and the review skill for a separate evidence review. Example: “Use the ai-data-plane-author skill at content-system/skills/ai-data-plane-author/SKILL.md to draft a memory use-case guide.”
5. Open a pull request using the checklist below. Preview Markdown in GitHub; a website preview requires a future publishing integration.

## Reusable skills

- [ai-data-plane-author](skills/ai-data-plane-author/SKILL.md): choose a format and develop a sourced, testable article.
- [ai-data-plane-review](skills/ai-data-plane-review/SKILL.md): review technical boundaries, evidence, usability and publication readiness.

Skills are stored as portable folders, not silently installed on anyone's machine. An agent can read them by path. For automatic discovery, copy the chosen folder into that agent's supported skill directory and preserve the adjacent reference links or use this repository checkout as the reference root. These skills do not grant permission to deploy resources, spend money or publish content.

## Front matter conventions

All templates use YAML front matter, compatible with a future Hugo adapter. `title`, `description`, `slug`, `date`, `draft` and `tags` are conventional content fields. Other fields are our internal metadata and need mapping to the eventual publishing system.

- `content_type`: quickstart, use-case-guide, benchmark or demo-companion.
- `audience`, `reader_outcome`, `component`: who it serves and what they can do.
- `owner`, `technical_reviewer`, `editorial_reviewer`: actual names or team handles; templates leave these empty.
- `last_verified`, `product_versions`, `sdk_versions`, `deployment_mode`: evidence scope, not assumed compatibility. Leave verification dates empty until actually tested.
- `evidence_status`: proposed, documentation-reviewed or live-tested. Label individual claims more precisely in the article.
- `sample_revision`, `video_url`, `sources`: traceable companion assets.

Templates intentionally contain empty values and guidance. Finished publication drafts must replace them or explain why a field does not apply. No metadata validator or hosted deployment is enabled by this kit.

## Editorial rules

Lead with a concrete reader outcome. Explain mandatory versus optional components and identify the model, application/framework, database, MCP, memory and tracing responsibilities only where relevant. Use current primary sources for feature claims. Record unknowns rather than filling them with assumptions.

Every practical guide includes prerequisites, cost boundaries, expected output, failure cases and cleanup. Do not place credentials in article text, screenshots or code. Synthetic examples must be labeled. Do not call a notebook demonstration a production benchmark.

For memory, distinguish current conversation, saved profile, historical records and managed memory. Provide configurable recipes instead of universal retention or retrieval settings. State which behavior is native, model-driven or implemented by application code.

For search, distinguish lexical, dense and hybrid, index family, embedding model and mandatory filters. For costs, distinguish tokens, API calls and total charges. For comparative claims, compare quality targets, disclose differences and publish losses as well as wins.

## Pull request checklist

Copy into the PR description:

- Reader, task and intended outcome:
- Template and component:
- Current primary sources and claim boundaries:
- Tested environment / exact sample revision:
- Commands run and observed output, or explicit untested status:
- Prerequisites, cost units and cleanup checked:
- Failure/negative example included:
- Links, images, alt text and secret exposure reviewed:
- Technical reviewer and unresolved questions:
- Editorial reviewer and next-step CTA:
- Owner and refresh trigger:

Review states: draft → technical review → editorial review → ready. These are conventions, not branch protection rules. A review recommendation is not approval to merge or publish.

Refresh when a referenced product/SDK changes, a setup step breaks, a model is retired, pricing changes or a reader reports a mismatch. Keep prior benchmark evidence versioned rather than rewriting historical results.

## What we learned from Qdrant

Reviewed November 4, 2026. Qdrant's public site repository documents Markdown content with front matter, Hugo archetypes, branch/PR contributions and automatic deployment after merge. Its blog archetype includes metadata for descriptions, authors, tags and preview images. Netlify configuration separates production and deploy-preview contexts. Workflows check internal links and generated snippet consistency/typechecking. No reusable `SKILL.md` was found in the inspected public repository tree; these AI authoring skills are our addition, not a claimed copy of Qdrant's internal process.

Borrow the architecture: versioned content, consistent metadata, reusable scaffolds, code/content alignment and reviews. Our templates use `draft: true` by default. We are not copying Qdrant's theme, branding, article text or infrastructure configuration.

Sources:

- [Repository authoring instructions](https://github.com/qdrant/landing_page)
- [Blog archetype](https://github.com/qdrant/landing_page/blob/master/qdrant-landing/archetypes/blog-post.md)
- [Netlify build and preview configuration](https://github.com/qdrant/landing_page/blob/master/netlify.toml)
- [Snippet workflow](https://github.com/qdrant/landing_page/blob/master/.github/workflows/snippets.yml)
- [Internal link workflow](https://github.com/qdrant/landing_page/blob/master/.github/workflows/internal-dead-links.yml)

## Next automation increment

Once the actual publishing destination is chosen, add metadata validation, Markdown/link checks and a preview build; test runnable snippets in isolated environments with explicit cloud cost limits. Adopt required review checks only after owners agree. This kit does not claim those checks, reviewer assignments or deployment previews are already active.
