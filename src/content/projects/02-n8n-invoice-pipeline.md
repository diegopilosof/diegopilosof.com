---
title: n8n Invoice Processing Pipeline
tagline: Reads incoming PDF and email invoices, extracts vendor, amount, and line items with AI, and writes structured data straight to the target system.
stack: ["n8n", "Claude API", "AI document extraction"]
pillar: AI-native finance ops
status: Shipped
order: 2
---

The manual data-entry step at the start of every AP cycle, removed. The pipeline ingests invoices from email or upload, extracts the structured fields with AI document parsing, validates against tolerance rules, and routes only the edge cases to a human. Built so the finance team stops typing and starts reviewing.
