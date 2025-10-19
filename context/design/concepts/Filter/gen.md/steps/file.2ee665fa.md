---
timestamp: 'Sun Oct 19 2025 16:57:10 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_165710.829ec75a.md]]'
content_id: 2ee665fac65299d5872ab2b46005767789563add499f6244c3cbdce1333d01cc
---

# file: src/concepts/Filter/FilterConcept.test.ts

```typescript
import { assertEquals, assertObjectMatch } from "jsr:@std/assert";
import { testDb } from "@utils/database.ts";
import FilterConcept from "./FilterConcept.ts";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Define a type for items that can be filtered, consistent with the concept's search action.
// These are not stored in the concept's database, but passed into the search function.
type TestFilterableItem = { _id: ID; [key: string]: any };

Deno.test("Filter Concept Tests", async (t) => {
  const [db, client] = await testDb();
  const filterConcept = new FilterConcept(db);

  Deno.test.beforeAll(() => {
    console.log("\n--- Starting Filter Concept Tests ---");
  });

  // --- Test createFilter action ---
  await t.step("Action: createFilter - should create a new filter with an empty criteria", async () => {
    console.log("\n[createFilter] Testing filter creation...");
    const result = await filterConcept.createFilter();

    if ("error" in result) {
      console.error(`[createFilter] Error: ${result.error}`);
      throw new Error(result.error);
    }

    const { filter: filterId } = result;
    console.log(`[createFilter] Created filter with ID: ${filterId}`);
    assertEquals(typeof filterId, "string", "Filter ID should be a string.");

    // Verify effects: filter exists in DB with empty criteria
    const createdFilter = await filterConcept.filters.findOne({ _id: filterId });
    assertObjectMatch(createdFilter!, { _id: filterId, criteria: {} });
    console.log("[createFilter] Verified filter exists in DB with empty criteria.");
  });

  // --- Test addCriteria action ---
  await t.step("Action: addCriteria - should add new criteria to an existing filter", async () => {
    console.log("\n[addCriteria] Testing adding new criteria...");
    const { filter: filterId } = await filterConcept.createFilter() as { filter: ID };
    console.log(`[addCriteria] Created filter for test: ${filterId}`);

    const key = "category";
    const values = ["electronics", "home"];
    const addResult = await filterConcept.addCriteria({ filter: filterId, key, values });
    assertEquals(Object.keys(addResult).length, 0, "addCriteria should return an empty object on success.");
    console.log(`[addCriteria] Added criteria {${key}: [${values.join(", ")}]} to filter ${filterId}.`);

    // Verify effects: criteria updated in DB
    const updatedFilter = await filterConcept.filters.findOne({ _id: filterId });
    assertObjectMatch(updatedFilter!, { _id: filterId, criteria: { [key]: values } });
    console.log("[addCriteria] Verified criteria was added correctly in DB.");
  });

  await t.step("Action: addCriteria - should update existing criteria for a filter", async () => {
    console.log("\n[addCriteria] Testing updating existing criteria...");
    const { filter: filterId } = await filterConcept.createFilter() as { filter: ID };
    await filterConcept.addCriteria({ filter: filterId, key: "category", values: ["electronics"] });
    console.log(`[addCriteria] Created filter ${filterId} with initial criteria.`);

    const newValues = ["home", "garden"];
    await filterConcept.addCriteria({ filter: filterId, key: "category", values: newValues });
    console.log(`[addCriteria] Updated criteria {category: [${newValues.join(", ")}]} for filter ${filterId}.`);

    // Verify effects: criteria updated in DB
    const updatedFilter = await filterConcept.filters.findOne({ _id: filterId });
    assertObjectMatch(updatedFilter!, { _id: filterId, criteria: { category: newValues } });
    console.log("[addCriteria] Verified criteria was updated correctly in DB.");
  });

  await t.step("Action: addCriteria - should return an error if filter does not exist", async () => {
    console.log("\n[addCriteria] Testing requires condition: filter must exist.");
    const nonExistentFilterId: ID = "nonExistent" as ID;
    const result = await filterConcept.addCriteria({ filter: nonExistentFilterId, key: "type", values: ["book"] });
    assertObjectMatch(result, { error: `Filter with ID ${nonExistentFilterId} not found.` });
    if ("error" in result) { // Added type guard
      console.log(`[addCriteria] Correctly returned error for non-existent filter: ${result.error}`);
    }
  });

  // --- Test clearFilter action ---
  await t.step("Action: clearFilter - should remove all criteria from an existing filter", async () => {
    console.log("\n[clearFilter] Testing clearing filter criteria...");
    const { filter: filterId } = await filterConcept.createFilter() as { filter: ID };
    await filterConcept.addCriteria({ filter: filterId, key: "brand", values: ["Nike"] });
    await filterConcept.addCriteria({ filter: filterId, key: "size", values: ["M", "L"] });
    console.log(`[clearFilter] Created filter ${filterId} with initial criteria.`);

    const clearResult = await filterConcept.clearFilter({ filter: filterId });
    assertEquals(Object.keys(clearResult).length, 0, "clearFilter should return an empty object on success.");
    console.log(`[clearFilter] Cleared all criteria for filter ${filterId}.`);

    // Verify effects: criteria is empty in DB
    const clearedFilter = await filterConcept.filters.findOne({ _id: filterId });
    assertObjectMatch(clearedFilter!, { _id: filterId, criteria: {} });
    console.log("[clearFilter] Verified criteria was cleared correctly in DB.");
  });

  await t.step("Action: clearFilter - should return an error if filter does not exist", async () => {
    console.log("\n[clearFilter] Testing requires condition: filter must exist.");
    const nonExistentFilterId: ID = "anotherNonExistent" as ID;
    const result = await filterConcept.clearFilter({ filter: nonExistentFilterId });
    assertObjectMatch(result, { error: `Filter with ID ${nonExistentFilterId} not found.` });
    if ("error" in result) { // Added type guard
      console.log(`[clearFilter] Correctly returned error for non-existent filter: ${result.error}`);
    }
  });

  // --- Test search action ---
  await t.step("Action: search - should return all items if filter has no criteria", async () => {
    console.log("\n[search] Testing search with no criteria...");
    const { filter: filterId } = await filterConcept.createFilter() as { filter: ID };
    const items: TestFilterableItem[] = [
      { _id: freshID(), name: "Item A" },
      { _id: freshID(), name: "Item B" },
    ];
    const itemIds = items.map(item => item._id);

    const searchResult = await filterConcept.search({ filter: filterId, items });
    if ("error" in searchResult) {
      console.error(`[search] Error: ${searchResult.error}`);
      throw new Error(searchResult.error);
    }
    assertEquals(searchResult.results.sort(), itemIds.sort(), "Should return all items when no criteria.");
    console.log("[search] Verified all items returned when filter has no criteria.");
  });

  await t.step("Action: search - should return items matching a single criterion", async () => {
    console.log("\n[search] Testing search with a single criterion...");
    const { filter: filterId } = await filterConcept.createFilter() as { filter: ID };
    await filterConcept.addCriteria({ filter: filterId, key: "category", values: ["electronics"] });

    const item1: TestFilterableItem = { _id: freshID(), name: "Laptop", category: "electronics" };
    const item2: TestFilterableItem = { _id: freshID(), name: "Book", category: "books" };
    const item3: TestFilterableItem = { _id: freshID(), name: "Monitor", category: "electronics" };
    const items = [item1, item2, item3];

    const searchResult = await filterConcept.search({ filter: filterId, items });
    if ("error" in searchResult) {
      console.error(`[search] Error: ${searchResult.error}`);
      throw new Error(searchResult.error);
    }
    assertEquals(searchResult.results.sort(), [item1._id, item3._id].sort(), "Should return only electronics.");
    console.log("[search] Verified items matching a single criterion are returned.");
  });

  await t.step("Action: search - should return items matching multiple criteria (AND logic)", async () => {
    console.log("\n[search] Testing search with multiple criteria (AND logic)...");
    const { filter: filterId } = await filterConcept.createFilter() as { filter: ID };
    await filterConcept.addCriteria({ filter: filterId, key: "category", values: ["electronics"] });
    await filterConcept.addCriteria({ filter: filterId, key: "brand", values: ["Samsung"] });

    const item1: TestFilterableItem = { _id: freshID(), name: "Samsung TV", category: "electronics", brand: "Samsung" }; // Match
    const item2: TestFilterableItem = { _id: freshID(), name: "Apple Laptop", category: "electronics", brand: "Apple" }; // Mismatch brand
    const item3: TestFilterableItem = { _id: freshID(), name: "Samsung Phone", category: "mobile", brand: "Samsung" }; // Mismatch category
    const item4: TestFilterableItem = { _id: freshID(), name: "Generic Speaker", category: "audio", brand: "Generic" }; // No match
    const items = [item1, item2, item3, item4];

    const searchResult = await filterConcept.search({ filter: filterId, items });
    if ("error" in searchResult) {
      console.error(`[search] Error: ${searchResult.error}`);
      throw new Error(searchResult.error);
    }
    assertEquals(searchResult.results.sort(), [item1._id].sort(), "Should return items matching ALL criteria.");
    console.log("[search] Verified items matching multiple criteria are returned.");
  });

  await t.step("Action: search - should handle item properties as arrays (OR logic within a criterion)", async () => {
    console.log("\n[search] Testing search with item properties as arrays...");
    const { filter: filterId } = await filterConcept.createFilter() as { filter: ID };
    await filterConcept.addCriteria({ filter: filterId, key: "tags", values: ["sale", "new_arrival"] });

    const item1: TestFilterableItem = { _id: freshID(), name: "Dress", tags: ["clothing", "sale"] }; // Matches "sale"
    const item2: TestFilterableItem = { _id: freshID(), name: "Shoes", tags: ["footwear"] }; // No match
    const item3: TestFilterableItem = { _id: freshID(), name: "Hat", tags: ["accessory", "new_arrival"] }; // Matches "new_arrival"
    const items = [item1, item2, item3];

    const searchResult = await filterConcept.search({ filter: filterId, items });
    if ("error" in searchResult) {
      console.error(`[search] Error: ${searchResult.error}`);
      throw new Error(searchResult.error);
    }
    assertEquals(searchResult.results.sort(), [item1._id, item3._id].sort(), "Should match if any tag value is present.");
    console.log("[search] Verified search works with item properties that are arrays.");
  });

  await t.step("Action: search - should handle item properties with no match", async () => {
    console.log("\n[search] Testing search with item properties not matching filter values...");
    const { filter: filterId } = await filterConcept.createFilter() as { filter: ID };
    await filterConcept.addCriteria({ filter: filterId, key: "color", values: ["red"] });

    const item1: TestFilterableItem = { _id: freshID(), name: "Blue Shirt", color: "blue" };
    const item2: TestFilterableItem = { _id: freshID(), name: "Green Pants", color: "green" };
    const items = [item1, item2];

    const searchResult = await filterConcept.search({ filter: filterId, items });
    if ("error" in searchResult) {
      console.error(`[search] Error: ${searchResult.error}`);
      throw new Error(searchResult.error);
    }
    assertEquals(searchResult.results.length, 0, "Should return no items if no match.");
    console.log("[search] Verified no items returned when item properties don't match.");
  });

  await t.step("Action: search - should handle items missing a required property", async () => {
    console.log("\n[search] Testing search with items missing a required property...");
    const { filter: filterId } = await filterConcept.createFilter() as { filter: ID };
    await filterConcept.addCriteria({ filter: filterId, key: "material", values: ["wood"] });

    const item1: TestFilterableItem = { _id: freshID(), name: "Wooden Chair", material: "wood" }; // Match
    const item2: TestFilterableItem = { _id: freshID(), name: "Plastic Table", material: "plastic" }; // Mismatch
    const item3: TestFilterableItem = { _id: freshID(), name: "Metal Lamp" }; // Missing property
    const items = [item1, item2, item3];

    const searchResult = await filterConcept.search({ filter: filterId, items });
    if ("error" in searchResult) {
      console.error(`[search] Error: ${searchResult.error}`);
      throw new Error(searchResult.error);
    }
    assertEquals(searchResult.results.sort(), [item1._id].sort(), "Items missing properties should not match.");
    console.log("[search] Verified items missing properties do not match criteria.");
  });

  await t.step("Action: search - should return an error if filter does not exist", async () => {
    console.log("\n[search] Testing requires condition: filter must exist.");
    const nonExistentFilterId: ID = "ghostFilter" as ID;
    const items: TestFilterableItem[] = [{ _id: freshID(), name: "Anything" }];
    const result = await filterConcept.search({ filter: nonExistentFilterId, items });
    assertObjectMatch(result, { error: `Filter with ID ${nonExistentFilterId} not found.` });
    if ("error" in result) { // Added type guard
      console.log(`[search] Correctly returned error for non-existent filter: ${result.error}`);
    }
  });

  // --- Principle Trace ---
  await t.step("Principle Trace: after adding search criteria to a filter, applying it to a collection returns only items matching all specified criteria", async () => {
    console.log("\n--- Principle Trace for Filter Concept ---");

    // 1. Create a filter
    console.log("[Principle] Step 1: Creating a new filter...");
    const createFilterResult = await filterConcept.createFilter();
    if ("error" in createFilterResult) throw new Error(createFilterResult.error);
    const filterId = createFilterResult.filter;
    console.log(`[Principle] Filter created with ID: ${filterId}`);

    // 2. Add search criteria to the filter
    console.log("[Principle] Step 2: Adding criteria to the filter.");
    const addCriteria1Result = await filterConcept.addCriteria({
      filter: filterId,
      key: "category",
      values: ["electronics", "apparel"],
    });
    assertEquals(Object.keys(addCriteria1Result).length, 0, "addCriteria should succeed.");
    console.log(`[Principle] Added criteria: {category: ["electronics", "apparel"]}`);

    const addCriteria2Result = await filterConcept.addCriteria({
      filter: filterId,
      key: "brand",
      values: ["Apple", "Samsung"],
    });
    assertEquals(Object.keys(addCriteria2Result).length, 0, "addCriteria should succeed.");
    console.log(`[Principle] Added criteria: {brand: ["Apple", "Samsung"]}`);

    const addCriteria3Result = await filterConcept.addCriteria({
      filter: filterId,
      key: "in_stock",
      values: ["true"], // Filter for items explicitly marked as in stock
    });
    assertEquals(Object.keys(addCriteria3Result).length, 0, "addCriteria should succeed.");
    console.log(`[Principle] Added criteria: {in_stock: ["true"]}`);


    // 3. Prepare a collection of items
    console.log("[Principle] Step 3: Preparing a sample collection of items.");
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

    // 4. Apply the filter to the collection
    console.log(`[Principle] Step 4: Applying filter ${filterId} to the items collection.`);
    const searchResult = await filterConcept.search({ filter: filterId, items });
    if ("error" in searchResult) throw new Error(searchResult.error);

    const expectedMatchingItemIds = [item1._id, item5._id, item7._id].sort();
    const actualMatchingItemIds = searchResult.results.sort();

    console.log(`[Principle] Expected matching item IDs: ${expectedMatchingItemIds.join(", ")}`);
    console.log(`[Principle] Actual matching item IDs:   ${actualMatchingItemIds.join(", ")}`);

    // 5. Verify that only items matching all specified criteria are returned
    assertEquals(actualMatchingItemIds, expectedMatchingItemIds, "The search results should contain only items matching ALL criteria.");
    console.log("[Principle] Verification successful: The filter correctly returned only items matching all specified criteria.");
    console.log("--- End of Principle Trace ---");
  });

  // --- Final cleanup after all steps are done ---
  console.log("--- Filter Concept Tests Complete ---");
  await client.close(); // Moved here to be directly awaited by the top-level Deno.test function
});
```
