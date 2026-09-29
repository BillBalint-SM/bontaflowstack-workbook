---
name: design-html
description: "Build responsive HTML or a project-native component from a brief, selected design or image, then inspect the actual rendered result."
---

# Implement the design

Read [HOST.md](../../HOST.md) for execution, state and authorization rules.
Modes: `implement`, `refine`. Choose the mode from the actual request.

1. Identify the accepted input, target files, existing framework, content and reusable design tokens. Reuse the supplied direction and relevant project conventions.
2. Plan the small implementation around information hierarchy, meaningful content, components, responsive states and interactions.
3. Implement semantic structure, usable keyboard controls, visible focus, labels, appropriate contrast and reduced-motion behavior. Keep application files in the requested project.
4. Use native CSS for ordinary layout. If measured text layout is specifically required, obtain the optional engine pretext resource and its license, or use an already installed project dependency.
5. Render desktop and narrow layouts through engine render, or use engine browser for live interaction. Inspect screenshots and page errors; check overflow, text wrapping and the requested controls.
6. Repair demonstrated in-scope defects and repeat the affected checks. Optional design-detect may provide additional findings when the user has installed that capability.
7. Return actual output paths, source direction, implemented states and verification evidence. A request for design-review can consume those checked outputs.

For image-to-code work, inspect the supplied image with the host's image viewing capability and distinguish visible properties from inferred behavior. Requested image generation or editing uses Codex's image tool through design-consultation, without separate API credentials.

## References

- [commands](../../references/commands.md)
- [browser](../../references/browser.md)
