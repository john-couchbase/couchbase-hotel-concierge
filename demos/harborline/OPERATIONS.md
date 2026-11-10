# Developer notes

## Hosting

Use this directory as the Vercel project root with Python 3.12. Install `requirements.txt`. The interface is in `public/`; server code is in `lib/`; `api/index.py` is the entry point.

Encrypted server variables: `HOTEL_CONFIG`, `HOTEL_MODEL_KEY`, and `HOTEL_SESSION_KEY`. Never commit their values or expose them to browser code.

Regenerate `lib/page_template.py` from `public/index.html` after changing HTML. Keep the generated page and public assets synchronized.

## Checks

From this directory:

```sh
PYTHONPATH=lib python -m unittest discover -s tests -v
```

The repository suite includes 13 hosted-handler tests and 6 selection tests. The working backend suite includes 18 additional core tests. Automated tests do not prove cloud connectivity; verify live tool results, durable receipts, and trace readback separately.

Deployment: `dpl_GqKuYDHq34SSAEbvpGuF3qfEbb6V`.

The daily model budget is enforced in `lib/runtime.py` and `lib/distributed.py`. Keep the per-process guard in `lib/engine.py` aligned when adjusting limits. Request limits are not a cloud billing cap.

## Policy selection

`lib/policies.json` defines the routing candidates and allowed tools. Matching catalog prompt sources are in `catalog-source/`. Publish changes through Agent Catalog before deploying the corresponding manifest. The runtime rejects a selected remote policy whose content differs from the manifest.

The displayed policy version is a SHA-256 content revision, not a Git commit. Selection events are included in traces and history. Tool execution maps are context-local to isolate simultaneous requests.

## Known limits

- The latest production inference smoke test reached the daily allowance. Retest after reset; do not treat deployment readiness as proof of inference success.
- Managed memory reports `deploymentFailed` and is not enabled in the runtime. Resolve provider authorization, verify deployment health, then test write/readback and recall before claiming it works.
- Model routing is not vector catalog search. Hotel tools execute fictional business logic.

See [verification-status.json](verification-status.json) for the latest evidence and [memory-diagnostics.md](memory-diagnostics.md) for memory troubleshooting history. Historical records are not current health checks.

Public access: opening the page creates a signed visitor session without a passphrase. API requests still require that session. Origin checks and the shared daily budget remain enforced.
