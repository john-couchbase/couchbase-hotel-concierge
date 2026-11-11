# Harborline · Couchbase hotel concierge

An interactive customer demo showing how an AI agent turns a hotel request into checked actions and a saved result.

[Open the live demo](https://couchbase-hotel-concierge.vercel.app/) · Open access · No password required

## What this demonstrates

Type a request or choose a suggested reply. Follow the conversation alongside the agent’s activity:

- **Policy:** which hotel rule applies, with its content version.
- **Tools:** which functions were selected, actually called, or left unused.
- **Checks:** the facts returned by each tool.
- **Decision:** a short explanation grounded in those results.
- **Receipt:** a confirmed demo booking you can reopen and review.

The activity view explains observable actions and results; it does not expose the model’s private internal reasoning.

## What we use

- **Couchbase AI Model Service:** live Amazon Nova Lite inference selects policies and calls tools.
- **Couchbase Agent Catalog:** stores the shared policy, seven request policies, and twelve hotel tools. The backend retrieves and verifies the selected records before execution.
- **Couchbase Agent Tracer:** records requests, policy selections, tool calls, results, and responses for review.
- **Couchbase Capella database:** saves chat sessions, booking receipts, activity history, and usage counters.
- **Vercel:** hosts the web interface and Python backend. The shared demo works independently of the presenter’s computer.

The backend enforces tool permissions, hotel rules, and confirmation before room booking or cancellation. Credentials stay on the server. Each visitor receives a separate signed session; the daily usage allowance is shared.

## A simple walkthrough

1. **Find a room:** enter dates and guests, review a quote, then confirm the demo booking.
2. **Ask for an upgrade:** watch membership and booking checks determine eligibility.
3. **Switch to dinner:** see the policy and selected tools change, then review the reservation result.
4. **Open Activity details:** compare selected versus called tools and inspect the policy version. Use Saved activity to revisit an earlier request.

Late checkout, booking review, and cancellation are also supported.

## What is real—and what is pending

- Model inference, catalog retrieval, database persistence, and tracing use real Couchbase services.
- Hotel inventory, availability, prices, and reservations are fictional. No payment or real hotel booking occurs.
- Policy selection uses model-based routing followed by named catalog lookup. Vector-based catalog search is not implemented.
- **Managed Agent Memory is not connected.** Saved sessions and receipts are database records, not managed semantic memory.
- The demo permits 40 hosted model calls per day, shared across users. One request can use several calls; the allowance resets at midnight Pacific.

## Verification

November 10, 2026: 36 automated tests pass. The latest live local integration passed room → upgrade → dinner, including catalog execution and trace readback. Production is deployed and its login, backend initialization, and updated UI assets were checked. A new hosted AI response still needs verification after the daily allowance resets.

[Developer setup and verification details](OPERATIONS.md)
