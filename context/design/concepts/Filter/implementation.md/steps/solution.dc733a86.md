---
timestamp: 'Sun Oct 19 2025 16:02:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_160245.2890efef.md]]'
content_id: dc733a8699455f2af9961e89c227913d17bd45b6cc17edd2b129209fd78c26e8
---

# solution: Redefining `search` for strict concept adherence

To strictly adhere to concept design principles, particularly polymorphism and independence, the `search` action (or its purpose) needs to be re-evaluated.

1. **Change `search` signature and effect**: Instead of `search` directly returning filtered `Items`, it could be renamed to `getCriteria` (or a query `_getCriteria`) and its effect would be to return the filter criteria itself.
   * **Proposed `getCriteria` action (or query)**:
     ```
     getCriteria(filter: Filter): (criteria: mapping from String to set of Strings)
         requires:
             filter exists
         effect:
             returns the criteria defined for the filter
     ```
2. **Composition via Synchronization**: The actual filtering of `Item`s would then be performed by a synchronization (sync) rule. This sync would orchestrate the interaction between the `Filter` concept and another concept that manages the properties of the `Item`s (e.g., a `Product` concept).

   * **Example Sync (pseudo-code)**:
     ```
     sync ApplyFilterToProducts
     when
         Request.searchProducts(filterId: Filter) // User requests to search products with a filter
     where
         in Filter: criteria of filterId is filterCriteria
         in Product: product p exists and has properties matching filterCriteria
     then
         Request.returnProducts(p) // Return the matching products
     ```
     In this scenario, the `Product` concept would expose a query (or an action) that can take `filterCriteria` and return matching products. This way, the `Filter` concept remains agnostic to `Item` properties, and the `Product` concept is responsible for knowing its own `Item` properties, with the `sync` bridging the two independent concerns.

This revised approach ensures that `Filter` focuses solely on managing filter definitions, preserving `Item` as a truly polymorphic identifier within its scope, and delegates property-based querying to the concepts that own those properties, thus maintaining modularity and separation of concerns. The current implementation implicitly exposes this problem by needing to coerce the `items` input.
