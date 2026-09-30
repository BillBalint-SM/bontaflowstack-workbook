---
name: bfs-business-builder
description: "Clarify a customer problem or product direction into a testable business brief."
---

# BFS Business Builder

Load [HOST.md](../../HOST.md) via `read bfs-business-builder`; follow its hash-based read protocol.
Modes: `explore`, `diagnose`. Use explore for a new direction and diagnose for an existing business problem. Default: `explore`.

1. Establish the customer, their problem, the proposed offer, available evidence and the decision the user needs to make. Read supplied material and relevant project context.
2. Separate observed facts, user decisions and assumptions. For an existing business, inspect the stated acquisition, value delivery and revenue constraints; for a new idea, focus on the riskiest demand assumption.
3. Read the discovery reference for dependent choices or ambiguous domain terms. Compare feasible approaches using customer benefit, effort, cost, dependencies and how quickly each can be tested. Resolve the upstream decision frontier, prune excluded branches and retain each actual decision source.
4. Define a small experiment with an observable success condition, a time or effort limit and the evidence that would change the decision. Research claims only when actual sources are available.
5. Produce the brief defined in Output; distinguish estimates from measured results.
6. Check the brief against the user's decisions. Save it when requested or as the agreed workflow output; hand the checked brief to bfs-spec when that next step is requested.

Brand positioning, a website goal or a marketing hypothesis can be the subject of the brief. A brief does not claim that a campaign, product or commercial result has already been delivered.

Output: Brief covering audience, problem, offer, differentiator, chosen approach, exclusions, uncertainties and next experiment.

## References

- [commands](../../references/commands.md): when constructing a core request.
- [discovery](../../references/discovery.md): before resolving dependent product choices or a domain collision.
