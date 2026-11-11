# Hotel Concierge

Ask for a room, an upgrade, or dinner plans. Follow the checks, tools, and decision beside the conversation.

[Open the demo](https://couchbase-hotel-concierge.vercel.app/) · [All demos](https://couchbase-demo-library.vercel.app/)

![Hotel Concierge preview](public/assets/social-preview-v3.png)

## Start here

- Type a request or choose a suggested option.
- Review the quote and confirm the demo booking.
- Open the receipt to review what was saved.
- Use Activity details and Saved activity to revisit the policy, tools, and results.

## What it uses

- Model Service selects policies and calls tools.
- Agent Catalog supplies policy and tool records; Agent Tracer records their execution.
- Capella stores sessions, receipts, history, and usage counters.
- Vercel hosts the interface and Python backend.
- Managed Agent Memory is not connected. Stored sessions are database records.
- Inventory and reservations are fictional. The shared limit is 40 model calls per day.

## Run locally

Use [Developer notes](OPERATIONS.md) for Python setup, configuration, and tests. Credentials stay on the server.

The [technical reference](README-REFERENCE.md#verification) records the last verification date and remaining live checks.

## Details and feedback

- [Technical reference and original documentation](README-REFERENCE.md)
- [Couchbase Design and UI Pattern Repair](https://github.com/john-couchbase/agent-skills)
- [Couchbase setup skill](https://github.com/john-couchbase/couchbase-aidp-setup)

When reporting an issue, include the request or input, what you expected, and a screenshot. Mention whether you used a phone, tablet, or computer.
