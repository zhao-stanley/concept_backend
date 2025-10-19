---
timestamp: 'Sun Oct 19 2025 16:06:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_160645.9115e7ea.md]]'
content_id: c7044e17eeab1d35d3382dde94850176b9f8bb7e67620e558656073f4cbdbbd8
---

# Trace: Filter Principle Fulfillment

**Principle:** after adding search criteria to a filter, applying it to a collection returns only items matching all specified criteria

This trace demonstrates the `Filter` concept fulfilling its principle through a sequence of actions:

1. **Create a filter**:
   * An `createFilter()` action is performed, returning a new, unique `filterId`. The concept's state is updated to include this new filter with no criteria.
   * `console.log` output will confirm the new filter ID.

2. **Add search criteria to the filter**:
   * Multiple `addCriteria()` actions are performed on the newly created `filterId`.
     * `addCriteria(filterId, "category", ["electronics", "apparel"])`
     * `addCriteria(filterId, "brand", ["Apple", "Samsung"])`
     * `addCriteria(filterId, "in_stock", ["true"])`
   * The concept's state (the `criteria` map for `filterId`) is progressively updated to include these criteria.
   * `console.log` output will show each criterion as it's added.

3. **Prepare a collection of items**:
   * A `TestFilterableItem[]` array is created, containing several sample items. These items include a mix of:
     * Items that *fully match* all three criteria (e.g., an "Apple Watch" that is "electronics", "Apple", and `in_stock: true`).
     * Items that mismatch one or more criteria (e.g., a "Sony Headphones" where "brand" is "Sony", not "Apple" or "Samsung").
     * Items that mismatch due to type/value (e.g., "Samsung TV" where `in_stock: false`).
     * Items that mismatch due to missing properties (e.g., "Old T-Shirt" missing `in_stock`).
   * This collection is created in memory *outside* the `Filter` concept's persistent state, as the `Filter` concept itself does not manage the items being filtered, only the criteria.
   * `console.log` output will list the prepared items.

4. **Apply the filter to the collection**:
   * A `search()` action is performed: `search(filterId, items)`.
   * The `Filter` concept retrieves the criteria associated with `filterId` from its state.
   * It then iterates through the provided `items` array, checking each item against *all* the stored criteria. An item must satisfy *every* criterion to be included in the results. For each criterion, an item property value (which can be a single string or an array of strings) must *overlap* with the filter's required values for that criterion key.
   * `console.log` output will indicate the start of the search.

5. **Verify results**:
   * The `results` returned by the `search` action (an array of `Item` IDs) are compared against the expected `ID`s of the items known to match all the criteria.
   * `assertEquals` is used to confirm that only the items that fulfill *all* the `category`, `brand`, and `in_stock` criteria are present in the `results`.
   * `console.log` output will display the expected and actual matching IDs, confirming the principle is upheld.

This trace comprehensively tests the core functionality of the `Filter` concept, demonstrating its purpose and principle by showing how criteria are defined and then correctly applied to a collection of items.
