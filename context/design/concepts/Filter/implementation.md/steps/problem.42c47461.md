---
timestamp: 'Sun Oct 19 2025 16:02:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_160245.2890efef.md]]'
content_id: 42c47461d7863fd94327248f0415d970e8d8c7b812c1ffd3b170665a63813c65
---

# problem: Issues with `search` action's adherence to concept design principles

The `search` action, as specified (`search(filter: Filter, items: set of Items): (results: set of Items)` with `Item` as a generic type parameter), presents a fundamental challenge to the "Concept Independence" and "Polymorphism" principles of concept design.

1. **Polymorphism Violation**: The core concept design states: "the concept can't assume that they \[type parameters like `Item`] have any properties at all and can only be compared to determine if two instances of the type are the same identifier/reference." However, the `search` action's `effects` ("return items that match all criteria in filter") directly imply that the `Filter` concept *must* inspect properties of the `Item`s (e.g., `item.color` or `item.size`) to compare them against the stored `criteria` (e.g., `{"color": ["red"]}`). If `Item` is merely an `ID`, the `Filter` concept has no means to access these properties.
2. **Concept Independence**: To fulfill the `search` action's effect, the `Filter` concept would implicitly need knowledge of the structure of `Item`s and their properties, which are typically managed by other concepts (e.g., a `Product` concept, a `Document` concept). Allowing `Filter` to directly access and interpret the properties of `Item`s (which belong to other concepts) introduces a hidden coupling that violates the principle of mutual independence.

The provided implementation of `search` addresses this by making a necessary, but problematic, assumption: that the `items` argument passed into the `search` method is not just an array of `ID`s, but an array of *objects that are already enriched with the properties relevant for filtering*. This is achieved via `items as unknown as ItemWithProperties[]`, which is a type assertion for demonstration but highlights the underlying design tension. If `items` were strictly `ID[]`, the current `search` logic would be unable to produce results based on the `criteria`'s property-based matching.
