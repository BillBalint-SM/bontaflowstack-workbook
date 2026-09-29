---
name: scrape
description: "Extract tables, products, listings or other specified fields from a real page into checked JSON, or answer from that page with sources."
---

# Structured page extraction

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `extract`, `answer`. Choose the mode from the actual request.

1. Establish the target page and required fields or question. This workflow covers one page per invocation; clarify broader crawling scope separately.
2. Use engine browser to open and inspect the actual page. If login is needed, use browse's visible human sign-in path and resume the same session.
3. Identify fields with fresh snapshot, text, html, links or data output. Use a bounded page expression or eval file for JSON-serializable extraction; pass request values as data.
4. Parse the result and check required fields, types, item count, non-empty key values and source URL. A failed load or login screen is an extraction error.
5. Repair selectors only when the observed page supports the change. Preserve failed attempts and stop on a missing prerequisite.
6. Return the requested JSON with provenance. Keep diagnostics out of the dataset. Persist an extracted dataset only when requested; workflow checkpoints store its reference and verification summary.

No saved browser automation is searched or executed. Reading a page does not authorize submission, posting, ordering or changes to records.

## References

- [commands](../../references/commands.md)
- [browser](../../references/browser.md)
