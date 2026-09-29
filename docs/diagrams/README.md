# Workflow diagrams

The repository README uses SVG exports generated with Archify. They support light
and dark color schemes and stay sharp when enlarged.

| Diagram | Image | Interactive view | Editable source |
|---|---|---|---|
| Plan and design | [SVG](plan-and-design.svg) | [HTML](plan-and-design.html) | [JSON](plan-and-design.json) |
| Check and deliver | [SVG](check-and-deliver.svg) | [HTML](check-and-deliver.html) | [JSON](check-and-deliver.json) |
| Save and resume | [SVG](save-and-resume.svg) | [HTML](save-and-resume.html) | [JSON](save-and-resume.json) |

Open an HTML file from your clone or downloaded source package in a browser.
It is self-contained and provides zoom, search, theme switching and export.
GitHub displays the SVG images; download the HTML to use its interactive controls.

## Update a diagram

Edit its JSON source, then run the following from the repository root with
Archify installed locally. Replace the example name for the other diagrams.

```powershell
$archify = Join-Path $env:USERPROFILE '.codex/skills/archify/bin/archify.mjs'
node $archify validate architecture docs/diagrams/plan-and-design.json --quality showcase --json
node $archify deliver architecture docs/diagrams/plan-and-design.json docs/diagrams/plan-and-design.html --quality showcase --json
node $archify visual-check docs/diagrams/plan-and-design.html --json
```

Inspect both themes, then open the HTML and choose **Export → SVG**. Save the
export beside the source using the same base name. The generated visual-check
screenshots and reports stay local and are excluded from Git.

[Delivery checks and file hashes](validation.json) identify the reviewed artifacts.
Regenerate that record when changing a diagram.
