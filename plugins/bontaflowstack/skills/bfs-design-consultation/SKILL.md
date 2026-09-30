---
name: bfs-design-consultation
description: "Define a visual identity or design system, compare distinct design alternatives, and refine the selected direction for a website or product interface."
---

# BFS Design Consultation

Load [HOST.md](../../HOST.md) for execution, state and authorization rules unless its full matching content is already loaded in this chat. Follow its hash-based read protocol.
Modes: `consult`, `variants`, `images`, `refine`. Choose the mode from the actual request.

1. Read the product brief, target audience, content, existing UI and design decisions. Identify the intended impression and constraints.
2. Select consultation, local HTML variants, Codex-generated images or refinement according to the request. Consultation works without an engine. Check render capability for HTML and the availability of Codex's image generation tool for images.
3. Establish a coherent system of colors, type, spacing, layout, shapes, component states and motion. Check readability, contrast and narrow-screen behavior against the intended use.
4. For alternatives, use the same content and constraints in distinct concepts. Default to three only when the user requests alternatives without a count. Write local variants and a comparison page, render each and inspect the results.
5. Generate and edit images with the current Codex image generation tool. Follow its image-reference and output rules; inspect an existing local image before editing it. No separate API key is required by this plugin. If the tool is unavailable, report the missing host capability and offer local HTML variants without claiming an image was generated. Use engine design compare for a local comparison board; record only the user's actual choice with design select.
6. Present the useful tradeoffs and preserve the user's actual selection. Exploration may finish without a selection. Refine an already selected direction without asking for it again.
7. Write or update the project's agreed design document, using concrete tokens and explaining decisions. Respect its existing name and format. Google's DESIGN.md is optional interoperability: use engine design-md only when the external Google tool is installed and that format is requested. It works without Stitch; this plugin does not itself integrate with Stitch.
8. Return the direction, alternatives, actual selection, checked preview paths and limitations. Pass the selected input to bfs-design-html for requested implementation.

Durable taste or preference changes go through bfs-bontaflow-memory on request. A generated image or successful render does not by itself record user approval.

## References

- [commands](../../references/commands.md)
