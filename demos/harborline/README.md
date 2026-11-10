# Harborline hotel concierge demo

Resumed live-model checkpoint — November 9, 2026.

This folder contains the latest UI and the Vercel Python backend candidate. Hotel inventory and reservations are demo data. Secrets are supplied only through encrypted server environment variables.

## Deployment status

- Live production: https://couchbase-hotel-concierge.vercel.app/ — authenticated Vercel Python backend with real Couchbase-hosted Nova Lite calls and fictional hotel inventory.
- Production deployment: `dpl_HQ1YNjhpzxZtKN4gWeZfjdZJZxtb` (READY).
- The model key now has the approved network rule. Real hosted calls work.
- Verified in the hosted preview: room search/quote, approval-gated booking, persisted receipt after refresh, upgrade, dinner, late checkout, and approval-gated cancellation. Catalog tool execution and Agent Tracer readback worked.
- Production login, real tool calls, catalog access, and trace writes were also verified directly on the production alias. Fictional booking DEMO-D4606B32 was confirmed and read back from Couchbase at $415.80 (two nights at $189 plus 10% demo tax; no payment).
- Managed memory recovery: the failed deployment was successfully removed through a management API retry after explicit approval. Its replacement `d8e4ab0a-6133-46ad-8616-7925998c38df` was accepted with the same bucket/configuration and is still provisioning. Hosted memory is not connected or verified yet.
- Current regression results: 12 hosted-backend tests and 18 core-backend tests passed. These supplement, rather than replace, the hosted flow checks.

## Hosting

Use this directory as the Vercel project root. Python 3.12; dependencies are in requirements.txt. The function uses lib/ and public/ supplies static assets. lib/page_template.py is a generated copy of public/index.html for server-side delivery; regenerate it when changing the HTML.

Required encrypted server environment variables: HOTEL_CONFIG, HOTEL_MODEL_KEY, HOTEL_DEMO_PASSWORD, HOTEL_SESSION_KEY. Never expose these to browser code or commit their values. HOTEL_CONFIG supplies scoped database access and optional memory configuration; see lib/runtime.py.

The approved ongoing database network rule permits IPv4 access; scoped credentials remain required. The hotel database is now healthy and Vercel is resumed under the existing $15/day authorization. The local backend is not required for hosted operation. No cluster on/off schedule is configured. Request limits are not a guaranteed billing cap. No separate hosting service is required.

## Verification and next steps

Run `python -m unittest discover -s tests -v` after installing requirements. These tests cover authentication, origin checks, distributed budgets, and session locking; they do not prove live cloud connectivity.

Next: wait for replacement memory to become healthy, create scoped access, add the new memory connection to encrypted Vercel configuration, redeploy, and verify write/readback and recall through the hosted runtime. Do not claim memory integration from the successful database receipt alone.

## Recovery history and future pause/resume

Code, deployments, encrypted Vercel settings, database buckets, catalog, sessions, and traces were retained. Memory compute was requested for removal; its configuration is saved in memory-resume-config.json, with a private full snapshot in the original workspace. No bucket was deleted.

1. The old failed deployment was confirmed absent before creating its replacement. If future removal fails, inspect status and obtain explicit recovery authorization before retrying deletion.
2. Turn john-ai-learning back on and wait for Healthy. Confirm spending authorization before restoring paid compute.
3. Recreate managed memory from the saved configuration using the same bucket and embedding model. Create a new scoped memory key and update the server configuration once healthy.
4. Verify the current model-key rule and retest the hosted preview before resuming Vercel traffic; the approved rule was present and working at this checkpoint.

Turning off a cluster retains storage charges; the last quoted OFF price was approximately $0.04/hour, not a freshly verified bill. Backups may continue expiring, and record TTLs are not suspended. The memory configuration uses a 24-hour TTL. Capella documentation also describes a 30-day maximum continuous off period; check before then if remaining paused.
