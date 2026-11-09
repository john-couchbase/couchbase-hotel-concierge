# Harborline hotel concierge demo

Paused checkpoint — November 9, 2026.

This folder contains the latest UI and the Vercel Python backend candidate. Hotel inventory and reservations are demo data. Secrets are supplied only through encrypted server environment variables.

## Deployment status

- Public UI: https://couchbase-hotel-concierge.vercel.app/ — currently simulated.
- Backend preview: https://couchbase-hotel-concierge-jmq1r0894-jkupchankos-projects.vercel.app/
- Preview login, Couchbase database access, and catalog initialization were verified before pausing.
- Hosted model calls still fail with AuthenticationError. The approved model-key network access update was staged in Capella but NOT saved. Finish that change and retest before promoting production.
- Managed Agent Memory was still deploying at the last check. It is not verified or connected in the hosted configuration.
- No successful complete hosted booking/memory test has been confirmed. Do not present this checkpoint as a fully connected production demo.

## Hosting

Use this directory as the Vercel project root. Python 3.12; dependencies are in requirements.txt. The function uses lib/ and public/ supplies static assets. lib/page_template.py is a generated copy of public/index.html for server-side delivery; regenerate it when changing the HTML.

Required encrypted server environment variables: HOTEL_CONFIG, HOTEL_MODEL_KEY, HOTEL_DEMO_PASSWORD, HOTEL_SESSION_KEY. Never expose these to browser code or commit their values. HOTEL_CONFIG supplies scoped database access and optional memory configuration; see lib/runtime.py.

The approved ongoing database network rule permits IPv4 access; scoped credentials remain required. Cloud resources were left running under the existing $15/day authorization. Request limits are not a guaranteed billing cap. No separate hosting service is required.

## Verification and next steps

Run `python -m unittest discover -s tests -v` after installing requirements. These tests cover authentication, origin checks, distributed budgets, and session locking; they do not prove live cloud connectivity.

Resume with the model-key access update, check memory provisioning, then test typed and button-driven requests, booking persistence, catalog/traces, and memory recall through the hosted preview. Promote only after those checks pass.
