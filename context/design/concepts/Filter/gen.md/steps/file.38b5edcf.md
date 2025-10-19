---
timestamp: 'Sun Oct 19 2025 17:02:03 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_170203.2a5e3510.md]]'
content_id: 38b5edcf8fe0d0769fa1cd7291912832a636dcc3de5dcc1b03ff929863e360e3
---

# file: src/concepts/Filter/FilterConcept.test.ts

```typescript
import { assertEquals } from "jsr:@std/assert"; // assertObjectMatch is no longer needed as there are no database documents specific to Filter concept.
import { testDb } from "@utils/database.ts";
import FilterConcept from "./FilterConcept.ts";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts"; // freshID is still needed for generating test item IDs.

// Define a type for items that can be filtered, consistent with the concept's search action.
// These are not stored in the concept's database, but passed into the search function.
type TestFilterableItem = { _id: ID; [key: string]: any };

// Type for the search criteria, consistent with the updated FilterConcept.
type SearchCriteria = Record<string, string[]>;

Deno.test("Filter Concept Tests", async (t) => {
  const [db, client] = await testDb();
  const filterConcept = new FilterConcept(db);

  Deno.test.beforeAll(() => {
    console.log("\n--- Starting Filter Concept Tests ---");
  });

  // --- Test search action ---
  await t.step("Action: search - should return all items if criteria is empty", async () => {
    console.log("\n[search] Testing search with empty criteria...");
    const items: TestFilterableItem[] = [
      { _id: freshID(), name: "Item A" },
      { _id: freshID(), name: "Item B" },
    ];
    const itemIds = items.map(item => item._id);
    const criteria: SearchCriteria = {}; // Empty criteria

    const searchResult = await filterConcept.search({ items, criteria });
    assertEquals(searchResult.results.sort(), itemIds.sort(), "Should return all items when criteria is empty.");
    console.log("[search] Verified all items returned when filter has no criteria.");
  });

  await t.step("Action: search - should return items matching a single criterion", async () => {
    console.log("\n[search] Testing search with a single criterion...");
    const criteria: SearchCriteria = { category: ["electronics"] };

    const item1: TestFilterableItem = { _id: freshID(), name: "Laptop", category: "electronics" };
    const item2: TestFilterableItem = { _id: freshID(), name: "Book", category: "books" };
    const item3: TestFilterableItem = { _id: freshID(), name: "Monitor", category: "electronics" };
    const items = [item1, item2, item3];

    const searchResult = await filterConcept.search({ items, criteria });
    assertEquals(searchResult.results.sort(), [item1._id, item3._id].sort(), "Should return only electronics.");
    console.log("[search] Verified items matching a single criterion are returned.");
  });

  await t.step("Action: search - should return items matching multiple criteria (AND logic)", async () => {
    console.log("\n[search] Testing search with multiple criteria (AND logic)...");
    const criteria: SearchCriteria = {
      category: ["electronics"],
      brand: ["Samsung"],
    };

    const item1: TestFilterableItem = { _id: freshID(), name: "Samsung TV", category: "electronics", brand: "Samsung" }; // Match
    const item2: TestFilterableItem = { _id: freshID(), name: "Apple Laptop", category: "electronics", brand: "Apple" }; // Mismatch brand
    const item3: TestFilterableItem = { _id: freshID(), name: "Samsung Phone", category: "mobile", brand: "Samsung" }; // Mismatch category
    const item4: TestFilterableItem = { _id: freshID(), name: "Generic Speaker", category: "audio", brand: "Generic" }; // No match
    const items = [item1, item2, item3, item4];

    const searchResult = await filterConcept.search({ items, criteria });
    assertEquals(searchResult.results.sort(), [item1._id].sort(), "Should return items matching ALL criteria.");
    console.log("[search] Verified items matching multiple criteria are returned.");
  });

  await t.step("Action: search - should handle item properties as arrays (OR logic within a criterion)", async () => {
    console.log("\n[search] Testing search with item properties as arrays...");
    const criteria: SearchCriteria = { tags: ["sale", "new_arrival"] };

    const item1: TestFilterableItem = { _id: freshID(), name: "Dress", tags: ["clothing", "sale"] }; // Matches "sale"
    const item2: TestFilterableItem = { _id: freshID(), name: "Shoes", tags: ["footwear"] }; // No match
    const item3: TestFilterableItem = { _id: freshID(), name: "Hat", tags: ["accessory", "new_arrival"] }; // Matches "new_arrival"
    const items = [item1, item2, item3];

    const searchResult = await filterConcept.search({ items, criteria });
    assertEquals(searchResult.results.sort(), [item1._id, item3._id].sort(), "Should match if any tag value is present.");
    console.log("[search] Verified search works with item properties that are arrays.");
  });

  await t.step("Action: search - should handle item properties with no match", async () => {
    console.log("\n[search] Testing search with item properties not matching criteria values...");
    const criteria: SearchCriteria = { color: ["red"] };

    const item1: TestFilterableItem = { _id: freshID(), name: "Blue Shirt", color: "blue" };
    const item2: TestFilterableItem = { _id: freshID(), name: "Green Pants", color: "green" };
    const items = [item1, item2];

    const searchResult = await filterConcept.search({ items, criteria });
    assertEquals(searchResult.results.length, 0, "Should return no items if no match.");
    console.log("[search] Verified no items returned when item properties don't match.");
  });

  await t.step("Action: search - should handle items missing a required property", async () => {
    console.log("\n[search] Testing search with items missing a required property...");
    const criteria: SearchCriteria = { material: ["wood"] };

    const item1: TestFilterableItem = { _id: freshID(), name: "Wooden Chair", material: "wood" }; // Match
    const item2: TestFilterableItem = { _id: freshID(), name: "Plastic Table", material: "plastic" }; // Mismatch
    const item3: TestFilterableItem = { _id: freshID(), name: "Metal Lamp" }; // Missing property
    const items = [item1, item2, item3];

    const searchResult = await filterConcept.search({ items, criteria });
    assertEquals(searchResult.results.sort(), [item1._id].sort(), "Items missing properties should not match.");
    console.log("[search] Verified items missing properties do not match criteria.");
  });

  // --- Principle Trace ---
  await t.step("Principle Trace: given a collection of items and a set of criteria, applying the filter returns only items that match all specified criteria", async () => {
    console.log("\n--- Principle Trace for Filter Concept ---");

    // 1. Define search criteria
    console.log("[Principle] Step 1: Defining search criteria.");
    const criteria: SearchCriteria = {
      category: ["electronics", "apparel"],
      brand: ["Apple", "Samsung"],
      in_stock: ["true"], // Filter for items explicitly marked as in stock
    };
    console.log(`[Principle] Criteria defined: ${JSON.stringify(criteria)}`);

    // 2. Prepare a collection of items
    console.log("[Principle] Step 2: Preparing a sample collection of items.");
    const item1: TestFilterableItem = { // Matches all criteria
      _id: freshID(),
      name: "Apple Watch",
      category: "electronics",
      brand: "Apple",
      in_stock: true,
      price: 399,
    };
    const item2: TestFilterableItem = { // Mismatch: brand not Apple/Samsung
      _id: freshID(),
      name: "Sony Headphones",
      category: "electronics",
      brand: "Sony",
      in_stock: true,
      price: 249,
    };
    const item3: TestFilterableItem = { // Mismatch: category not electronics/apparel
      _id: freshID(),
      name: "Fiction Book",
      category: "books",
      brand: "Penguin",
      in_stock: true,
      price: 15,
    };
    const item4: TestFilterableItem = { // Mismatch: not in stock
      _id: freshID(),
      name: "Samsung TV",
      category: "electronics",
      brand: "Samsung",
      in_stock: false,
      price: 999,
    };
    const item5: TestFilterableItem = { // Matches all criteria
      _id: freshID(),
      name: "Samsung Galaxy S23",
      category: "electronics",
      brand: "Samsung",
      in_stock: true,
      price: 799,
    };
    const item6: TestFilterableItem = { // Mismatch: missing in_stock property
        _id: freshID(),
        name: "Old T-Shirt",
        category: "apparel",
        brand: "Nike",
        price: 20
    };
    const item7: TestFilterableItem = { // Matches all criteria (apparel category, Apple brand assumed for example, in_stock true)
        _id: freshID(),
        name: "Apple T-Shirt",
        category: "apparel",
        brand: "Apple",
        in_stock: true,
        price: 30
    };

    const items: TestFilterableItem[] = [item1, item2, item3, item4, item5, item6, item7];
    console.log(`[Principle] Sample items prepared. Total: ${items.length}`);

    // 3. Apply the filter to the collection
    console.log(`[Principle] Step 3: Applying the filter to the items collection.`);
    const searchResult = await filterConcept.search({ items, criteria });

    const expectedMatchingItemIds = [item1._id, item5._id, item7._id].sort();
    const actualMatchingItemIds = searchResult.results.sort();

    console.log(`[Principle] Expected matching item IDs: ${expectedMatchingItemIds.join(", ")}`);
    console.log(`[Principle] Actual matching item IDs:   ${actualMatchingItemIds.join(", ")}`);

    // 4. Verify that only items matching all specified criteria are returned
    assertEquals(actualMatchingItemIds, expectedMatchingItemIds, "The search results should contain only items matching ALL criteria.");
    console.log("[Principle] Verification successful: The filter correctly returned only items matching all specified criteria.");
    console.log("--- End of Principle Trace ---");
  });

  // --- Final cleanup after all steps are done ---
  console.log("--- Filter Concept Tests Complete ---");
  await client.close(); // Ensures the MongoDB client connection is closed after all tests.
});
```

***

## Explanation of Implementation and Test Changes:

1. **Stateless `Filter` Concept**:
   * The `FilterConcept` class no longer manages a `filters` MongoDB collection. The `FilterDocument` interface and `PREFIX` constant (related to the collection name) are effectively removed for `Filter`'s *own* state.
   * The `createFilter`, `addCriteria`, and `clearFilter` actions are removed from the concept, as `Filter` is no longer responsible for storing filter definitions.
   * The `search` action is now the primary (and only) action. Its signature has changed to `search({ items: FilterableItem[], criteria: SearchCriteria }): Promise<{ results: Item[] }>`. It now takes the full set of `items` to filter and the `criteria` directly as input arguments.
   * The return type of `search` is simplified to `Promise<{ results: Item[] }>`, as it no longer needs to handle errors related to a "non-existent filter ID" since the criteria are provided directly. Any operational error (e.g., unexpected data type) would be an exceptional throw, not a standard return.

2. **`FilterableItem` Type**:
   * The `FilterableItem` type remains crucial. It clarifies that while `Item` is a generic `ID`, the `search` action expects objects in the `items` array that possess both an `_id` (the `Item` ID) and other properties that can be evaluated against the `criteria`. This maintains the concept's completeness and independence, as it doesn't need to know the *origin* of these items, only their structure.

3. **Test File Refactoring**:
   * All test steps related to `createFilter`, `addCriteria`, and `clearFilter` are removed.
   * The existing `search` test steps are updated to directly pass the `criteria` object to the `filterConcept.search` method.
   * Error checks like `if ("error" in searchResult)` are removed for the `search` action, as the new `search` signature implies it always returns a `results` object upon successful execution.
   * The `Principle Trace` is rewritten to align with the stateless filtering process: defining criteria, preparing items, and then applying the filter (via the `search` action).
   * The `assertEquals` and `assertObjectMatch` imports are adjusted, removing `assertObjectMatch` as there are no filter documents to assert against.
   * The `client.close()` is maintained at the end of the top-level `Deno.test` block to ensure proper resource cleanup and prevent Deno's leak detection.

This revised structure makes the `Filter` concept a pure, reusable function for applying filtering logic, fully independent of how the items are stored or how the criteria are managed upstream.
