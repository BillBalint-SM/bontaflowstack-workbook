# Issue tracker: GitHub

This repository uses GitHub Issues at `BillBalint-SM/bontaflowstack-workbook` for specifications and work tracking. Pin that repository in each `gh` command so the guidance also works in a checkout without a configured remote.

## Operations

- Publish a spec: write the exact issue body to a temporary UTF-8 file, then run `gh issue create --repo BillBalint-SM/bontaflowstack-workbook --title <title> --body-file <file>`.
- Read an issue: `gh issue view <number> --repo BillBalint-SM/bontaflowstack-workbook --comments`.
- List issues: `gh issue list --repo BillBalint-SM/bontaflowstack-workbook --state open --json number,title,body,labels`.
- Comment: `gh issue comment <number> --repo BillBalint-SM/bontaflowstack-workbook --body-file <file>`.
- Apply or remove a label: `gh issue edit <number> --repo BillBalint-SM/bontaflowstack-workbook --add-label <label>` or `--remove-label <label>`.
- Close an issue: `gh issue close <number> --repo BillBalint-SM/bontaflowstack-workbook`.

When a skill says to publish to the issue tracker, create a GitHub issue. When it says to fetch a ticket, read the GitHub issue and its comments. Pull requests are not a request intake surface for these skills.

The `ready-for-agent` label denotes a fully specified task. Verify that it exists before applying it to a spec; create it if absent.
