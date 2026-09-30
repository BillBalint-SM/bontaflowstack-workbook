---
name: bfs-design-consultation
description: "Define a visual identity, compare design directions or refine the selected design system."
---

# BFS Design Consultation

Load [HOST.md](../../HOST.md) via `read bfs-design-consultation`; follow its hash-based read protocol.
Modes: `consult` for direction, `variants` for HTML alternatives, `images` for generated/edited visuals, `refine` for an existing direction. Default: `consult`.

1. Read brief, audience, content, existing UI and decisions; establish impression and constraints. Consultation needs no engine. Check render capability for HTML and Codex image-tool availability for images.
2. Define colors, type, spacing, layout, shapes, component states and motion; check readability, contrast and narrow-screen behavior.
3. For alternatives, keep content/constraints equivalent. Default to three only when no count is requested. Write variants and a comparison page; render and inspect each.
4. For images, use Codex's current image tool and its reference/output rules; inspect local originals before editing. If unavailable, report it and offer HTML variants without claiming generated images. Use engine design compare for a comparison board and design select for the actual user choice.
5. Present tradeoffs and preserve the actual selection. Exploration may finish without one; refinement reuses an existing selection. Generation/rendering alone is not approval.
6. Write/update the agreed design document with concrete tokens and decision reasons, preserving its name/format. Use engine design-md only for requested Google DESIGN.md with that external tool installed; it works without Stitch, which BFS does not integrate.

Pass selected input to bfs-design-html for requested implementation. Save durable taste/preferences through bfs-bontaflow-memory only on request.

Output: Direction, alternatives, actual selection, design document, checked previews and limitations.

## References

- [capabilities](../../references/capabilities.md): before checking or using engines, image or external design tools; includes credential requirements.
- [commands](../../references/commands.md): when constructing a core request.
