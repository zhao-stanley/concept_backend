---
timestamp: 'Sun Oct 19 2025 17:20:33 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_172033.cbcb59c3.md]]'
content_id: 547402323a0ac1443b558ffbaf12ef9218782ae89d9206c757a7b94546281ef5
---

# file: src/Tagging/TaggingConcept.test.ts

```typescript
import { assertEquals, assertNotEquals, assertArrayIncludes } from "jsr:@std/assert";
import { testDb, freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import TaggingConcept from "./TaggingConcept.ts";

Deno.test("Tagging Concept - Core Functionality", async (t) => {
  const [db, client] = await testDb();
  const taggingConcept = new TaggingConcept(db);

  const item1: ID = freshID();
  const item2: ID = freshID();
  // const item3: ID = freshID(); // item3 was not used, removed to avoid confusion

  console.log("\n--- Tagging Concept Tests ---");

  await t.step("Principle Test: Tagging and Retrieval", async () => {
    console.log("Trace: Fulfilling the principle - after tagging an item with labels, users can retrieve all items with specific tags or find all tags on an item.");

    // 1. Tag item1 with "document" and "important"
    console.log(`Action: tag(item: ${item1}, labels: ["document", "important"])`);
    const tagResult1 = await taggingConcept.tag({ item: item1, labels: ["document", "important"] });
    assertEquals(tagResult1, {}, "Should successfully tag item1 with 'document' and 'important'");

    // 2. Tag item1 again with "urgent" (adding to existing)
    console.log(`Action: tag(item: ${item1}, labels: ["urgent"])`);
    const tagResult2 = await taggingConcept.tag({ item: item1, labels: ["urgent"] });
    assertEquals(tagResult2, {}, "Should successfully add 'urgent' to item1's tags");

    // 3. Tag item2 with "important" and "invoice"
    console.log(`Action: tag(item: ${item2}, labels: ["important", "invoice"])`);
    const tagResult3 = await taggingConcept.tag({ item: item2, labels: ["important", "invoice"] });
    assertEquals(tagResult3, {}, "Should successfully tag item2 with 'important' and 'invoice'");

    // Verify: Retrieve all tags for item1
    console.log(`Query: _getTags(item: ${item1})`);
    const tagsForItem1Result = await taggingConcept._getTags({ item: item1 });
    // Fixed: Assert not error, then cast
    assertNotEquals((tagsForItem1Result as {error: string}[]).length > 0 && 'error' in tagsForItem1Result[0], true, `_getTags for item1 should not return an error: ${JSON.stringify(tagsForItem1Result)}`);
    const tagsForItem1 = tagsForItem1Result as {tag: string}[];
    assertEquals(tagsForItem1.map(t => t.tag).sort(), ["document", "important", "urgent"].sort(), "item1 should have tags 'document', 'important', 'urgent'");
    console.log(`Confirmed: Tags for item ${item1} are: ${JSON.stringify(tagsForItem1.map(t => t.tag))}`);

    // Verify: Retrieve items by tag "important"
    console.log(`Query: _getItemsByTag(label: "important")`);
    const itemsWithImportantTagResult = await taggingConcept._getItemsByTag({ label: "important" });
    // Fixed: Assert not error, then cast
    assertNotEquals((itemsWithImportantTagResult as {error: string}[]).length > 0 && 'error' in itemsWithImportantTagResult[0], true, `_getItemsByTag for 'important' should not return an error: ${JSON.stringify(itemsWithImportantTagResult)}`);
    const itemsWithImportantTag = itemsWithImportantTagResult as {item: ID}[];
    assertEquals(itemsWithImportantTag.map(i => i.item).sort(), [item1, item2].sort(), "Items with 'important' tag should be item1 and item2");
    console.log(`Confirmed: Items with tag 'important' are: ${JSON.stringify(itemsWithImportantTag.map(i => i.item))}`);

    // Verify: Retrieve items by tag "document"
    console.log(`Query: _getItemsByTag(label: "document")`);
    const itemsWithDocumentTagResult = await taggingConcept._getItemsByTag({ label: "document" });
    // Fixed: Assert not error, then cast
    assertNotEquals((itemsWithDocumentTagResult as {error: string}[]).length > 0 && 'error' in itemsWithDocumentTagResult[0], true, `_getItemsByTag for 'document' should not return an error: ${JSON.stringify(itemsWithDocumentTagResult)}`);
    const itemsWithDocumentTag = itemsWithDocumentTagResult as {item: ID}[];
    assertEquals(itemsWithDocumentTag.map(i => i.item), [item1], "Items with 'document' tag should be item1");
    console.log(`Confirmed: Items with tag 'document' are: ${JSON.stringify(itemsWithDocumentTag.map(i => i.item))}`);
  });

  await t.step("Action: tag()", async () => {
    console.log("\nTesting tag() action.");
    const newItem: ID = freshID();

    console.log(`Action: tag(item: ${newItem}, labels: ["new", "test"])`);
    const result = await taggingConcept.tag({ item: newItem, labels: ["new", "test"] });
    assertEquals(result, {}, "Should successfully tag a new item");
    const tagsResult = await taggingConcept._getTags({ item: newItem });
    const tags = tagsResult as {tag: string}[]; // Fixed: Cast after getting result
    assertEquals(tags.map(t => t.tag).sort(), ["new", "test"].sort(), "New item should have the assigned tags");

    console.log(`Action: tag(item: ${newItem}, labels: ["test", "another"])`);
    const updateResult = await taggingConcept.tag({ item: newItem, labels: ["test", "another"] });
    assertEquals(updateResult, {}, "Should successfully add more tags, ignoring duplicates");
    const updatedTagsResult = await taggingConcept._getTags({ item: newItem });
    const updatedTags = updatedTagsResult as {tag: string}[]; // Fixed: Cast after getting result
    assertEquals(updatedTags.map(t => t.tag).sort(), ["new", "test", "another"].sort(), "Item should have combined unique tags");

    console.log(`Action: tag(item: "", labels: ["invalid"]) - Testing empty item ID`);
    const emptyItemResult = await taggingConcept.tag({ item: "" as ID, labels: ["invalid"] });
    assertEquals(emptyItemResult, { error: "Item ID cannot be empty" }, "Should return error for empty item ID");

    console.log(`Action: tag(item: ${freshID()}, labels: []) - Testing empty labels array`);
    const emptyLabelsResult = await taggingConcept.tag({ item: freshID(), labels: [] });
    assertEquals(emptyLabelsResult, {}, "Should return success (no-op) for empty labels array");
  });

  await t.step("Action: _getItemsByTag()", async () => {
    console.log("\nTesting _getItemsByTag() query.");
    const testItemA: ID = freshID();
    const testItemB: ID = freshID();
    await taggingConcept.tag({ item: testItemA, labels: ["alpha", "beta"] });
    await taggingConcept.tag({ item: testItemB, labels: ["beta", "gamma"] });

    console.log(`Query: _getItemsByTag(label: "beta")`);
    const itemsByBetaResult = await taggingConcept._getItemsByTag({ label: "beta" });
    const itemsByBeta = itemsByBetaResult as {item: ID}[]; // Fixed: Cast after getting result
    assertArrayIncludes(itemsByBeta.map(i => i.item), [testItemA, testItemB], "Should find both testItemA and testItemB for 'beta'");

    console.log(`Query: _getItemsByTag(label: "alpha")`);
    const itemsByAlphaResult = await taggingConcept._getItemsByTag({ label: "alpha" });
    const itemsByAlpha = itemsByAlphaResult as {item: ID}[]; // Fixed: Cast after getting result
    assertEquals(itemsByAlpha.map(i => i.item), [testItemA], "Should find only testItemA for 'alpha'");

    console.log(`Query: _getItemsByTag(label: "nonexistent")`);
    const itemsByNonExistent = await taggingConcept._getItemsByTag({ label: "nonexistent" });
    assertEquals(itemsByNonExistent, [], "Should return empty array for non-existent tag");

    console.log(`Query: _getItemsByTag(label: "") - Testing empty label`);
    const emptyLabelResult = await taggingConcept._getItemsByTag({ label: "" });
    assertEquals(emptyLabelResult, [{ error: "Tag label cannot be empty" }], "Should return error for empty label");
  });

  await t.step("Action: _getTags()", async () => {
    console.log("\nTesting _getTags() query.");
    const testItemC: ID = freshID();
    await taggingConcept.tag({ item: testItemC, labels: ["red", "green", "blue"] });

    console.log(`Query: _getTags(item: ${testItemC})`);
    const tagsForTestItemCResult = await taggingConcept._getTags({ item: testItemC });
    const tagsForTestItemC = tagsForTestItemCResult as {tag: string}[]; // Fixed: Cast after getting result
    assertEquals(tagsForTestItemC.map(t => t.tag).sort(), ["red", "green", "blue"].sort(), "Should retrieve all tags for testItemC");

    console.log(`Query: _getTags(item: ${freshID()}) - Testing non-existent item`);
    const tagsForNonExistentItem = await taggingConcept._getTags({ item: freshID() });
    assertEquals(tagsForNonExistentItem, [], "Should return empty array for non-existent item");

    console.log(`Query: _getTags(item: "") - Testing empty item ID`);
    const emptyItemResult = await taggingConcept._getTags({ item: "" as ID });
    assertEquals(emptyItemResult, [{ error: "Item ID cannot be empty" }], "Should return error for empty item ID");
  });

  await t.step("Action: removeTag()", async () => {
    console.log("\nTesting removeTag() action.");
    const removeItem: ID = freshID();
    await taggingConcept.tag({ item: removeItem, labels: ["tagA", "tagB", "tagC"] });
    let currentTagsResult = await taggingConcept._getTags({ item: removeItem });
    let currentTags = currentTagsResult as {tag: string}[]; // Fixed: Cast after getting result
    assertEquals(currentTags.map(t => t.tag).sort(), ["tagA", "tagB", "tagC"].sort(), "Initial tags for removeItem");

    console.log(`Action: removeTag(item: ${removeItem}, label: "tagB")`);
    const removeResult = await taggingConcept.removeTag({ item: removeItem, label: "tagB" });
    assertEquals(removeResult, {}, "Should successfully remove 'tagB'");
    currentTagsResult = await taggingConcept._getTags({ item: removeItem });
    currentTags = currentTagsResult as {tag: string}[]; // Fixed: Cast after getting result
    assertEquals(currentTags.map(t => t.tag).sort(), ["tagA", "tagC"].sort(), "Tags after removing 'tagB'");

    console.log(`Action: removeTag(item: ${removeItem}, label: "nonExistentTag")`);
    const removeNonExistentResult = await taggingConcept.removeTag({ item: removeItem, label: "nonExistentTag" });
    assertNotEquals(removeNonExistentResult, {}, "Should return an error for removing a non-existent tag on an existing item");
    assertNotEquals((removeNonExistentResult as {error: string}).error, undefined, "Error should contain a message"); // Cast for specific error check
    currentTagsResult = await taggingConcept._getTags({ item: removeItem });
    currentTags = currentTagsResult as {tag: string}[]; // Fixed: Cast after getting result
    assertEquals(currentTags.map(t => t.tag).sort(), ["tagA", "tagC"].sort(), "Tags should remain unchanged after trying to remove non-existent tag");

    console.log(`Action: removeTag(item: ${freshID()}, label: "anyTag") - Testing non-existent item`);
    const removeNonExistentItemResult = await taggingConcept.removeTag({ item: freshID(), label: "anyTag" });
    assertNotEquals(removeNonExistentItemResult, {}, "Should return an error for non-existent item");
    assertNotEquals((removeNonExistentItemResult as {error: string}).error, undefined, "Error should contain a message"); // Cast for specific error check

    console.log(`Action: removeTag(item: "", label: "invalid") - Testing empty item ID`);
    const emptyItemRemoveResult = await taggingConcept.removeTag({ item: "" as ID, label: "invalid" });
    assertEquals(emptyItemRemoveResult, { error: "Item ID cannot be empty" }, "Should return error for empty item ID");

    console.log(`Action: removeTag(item: ${removeItem}, label: "") - Testing empty label`);
    const emptyLabelRemoveResult = await taggingConcept.removeTag({ item: removeItem, label: "" });
    assertEquals(emptyLabelRemoveResult, { error: "Tag label cannot be empty" }, "Should return error for empty label");
  });

  await t.step("Action: removeAllTags()", async () => {
    console.log("\nTesting removeAllTags() action.");
    const removeAllItem: ID = freshID();
    await taggingConcept.tag({ item: removeAllItem, labels: ["tagX", "tagY", "tagZ"] });
    let currentTagsResult = await taggingConcept._getTags({ item: removeAllItem });
    let currentTags = currentTagsResult as {tag: string}[]; // Fixed: Cast after getting result
    assertEquals(currentTags.map(t => t.tag).sort(), ["tagX", "tagY", "tagZ"].sort(), "Initial tags for removeAllItem");

    console.log(`Action: removeAllTags(item: ${removeAllItem})`);
    const removeAllResult = await taggingConcept.removeAllTags({ item: removeAllItem });
    assertEquals(removeAllResult, {}, "Should successfully remove all tags for removeAllItem");
    currentTagsResult = await taggingConcept._getTags({ item: removeAllItem });
    currentTags = currentTagsResult as {tag: string}[]; // Fixed: Cast after getting result
    assertEquals(currentTags, [], "Item should have no tags after removeAllTags");

    console.log(`Action: removeAllTags(item: ${freshID()}) - Testing non-existent item`);
    const removeNonExistentAllResult = await taggingConcept.removeAllTags({ item: freshID() });
    assertNotEquals(removeNonExistentAllResult, {}, "Should return an error for non-existent item");
    assertNotEquals((removeNonExistentAllResult as {error: string}).error, undefined, "Error should contain a message"); // Cast for specific error check

    console.log(`Action: removeAllTags(item: "") - Testing empty item ID`);
    const emptyItemRemoveAllResult = await taggingConcept.removeAllTags({ item: "" as ID });
    assertEquals(emptyItemRemoveAllResult, { error: "Item ID cannot be empty" }, "Should return error for empty item ID");
  });

  await client.close();
});
```

I'm running into test failures now:

running 1 test from ./src/concepts/Tagging/TaggingConcept.test.ts
Tagging Concept - Core Functionality ...
\------- post-test output -------

\--- Tagging Concept Tests ---
\----- post-test output end -----
Principle Test: Tagging and Retrieval ...
\------- post-test output -------
Trace: Fulfilling the principle - after tagging an item with labels, users can retrieve all items with specific tags or find all tags on an item.
Action: tag(item: 0199fe57-c658-751c-83f3-9373e0f5e508, labels: \["document", "important"])
Action: tag(item: 0199fe57-c658-751c-83f3-9373e0f5e508, labels: \["urgent"])
Action: tag(item: 0199fe57-c658-7189-9384-b1975e9d1934, labels: \["important", "invoice"])
Query: \_getTags(item: 0199fe57-c658-751c-83f3-9373e0f5e508)
Confirmed: Tags for item 0199fe57-c658-751c-83f3-9373e0f5e508 are: \["document","important","urgent"]
Query: \_getItemsByTag(label: "important")
Confirmed: Items with tag 'important' are: \["0199fe57-c658-751c-83f3-9373e0f5e508","0199fe57-c658-7189-9384-b1975e9d1934"]
Query: \_getItemsByTag(label: "document")
Confirmed: Items with tag 'document' are: \["0199fe57-c658-751c-83f3-9373e0f5e508"]
\----- post-test output end -----
Principle Test: Tagging and Retrieval ... ok (144ms)
Action: tag() ...
\------- post-test output -------

Testing tag() action.
Action: tag(item: 0199fe57-c6ea-74ca-bcba-a0b9989b5899, labels: \["new", "test"])
Action: tag(item: 0199fe57-c6ea-74ca-bcba-a0b9989b5899, labels: \["test", "another"])
Action: tag(item: "", labels: \["invalid"]) - Testing empty item ID
Action: tag(item: 0199fe57-c737-70ab-af95-0bffd08d87fe, labels: \[]) - Testing empty labels array
\----- post-test output end -----
Action: tag() ... ok (77ms)
Action: \_getItemsByTag() ...
\------- post-test output -------

Testing \_getItemsByTag() query.
Query: \_getItemsByTag(label: "beta")
Query: \_getItemsByTag(label: "alpha")
Query: \_getItemsByTag(label: "nonexistent")
Query: \_getItemsByTag(label: "") - Testing empty label
\----- post-test output end -----
Action: \_getItemsByTag() ... ok (96ms)
Action: \_getTags() ...
\------- post-test output -------

Testing \_getTags() query.
Query: \_getTags(item: 0199fe57-c797-7c7b-92c7-5ccb9574c4a6)
Query: \_getTags(item: 0199fe57-c7be-7657-a797-6d78b9079fce) - Testing non-existent item
Query: \_getTags(item: "") - Testing empty item ID
\----- post-test output end -----
Action: \_getTags() ... ok (57ms)
Action: removeTag() ...
\------- post-test output -------

Testing removeTag() action.
Action: removeTag(item: 0199fe57-c7d1-7ce3-8c35-874ac5675b1e, label: "tagB")
Action: removeTag(item: 0199fe57-c7d1-7ce3-8c35-874ac5675b1e, label: "nonExistentTag")
\----- post-test output end -----
Action: removeTag() ... FAILED (97ms)
Action: removeAllTags() ...
\------- post-test output -------

Testing removeAllTags() action.
Action: removeAllTags(item: 0199fe57-c832-7a23-9a77-6417bffb8aa7)
Action: removeAllTags(item: 0199fe57-c881-7eab-802d-e26e473a6634) - Testing non-existent item
Action: removeAllTags(item: "") - Testing empty item ID
\----- post-test output end -----
Action: removeAllTags() ... ok (97ms)
Tagging Concept - Core Functionality ... FAILED (due to 1 failed step) (1s)
running 0 tests from ./src/concepts/Video/VideoConcept.test.ts

ERRORS

Tagging Concept - Core Functionality ... Action: removeTag() => ./src/concepts/Tagging/TaggingConcept.test.ts:134:11
error: AssertionError: Expected actual: \[object Object] not to be: \[object Object]: Should return an error for removing a non-existent tag on an existing item
throw new AssertionError(
^
at assertNotEquals (https://jsr.io/@std/assert/1.0.7/not\_equals.ts:33:9)
at file:///Users/stanleyzhao/Documents/Github/concept\_backend/src/concepts/Tagging/TaggingConcept.test.ts:151:5
at eventLoopTick (ext:core/01\_core.js:179:7)
at async innerWrapped (ext:cli/40\_test.js:181:5)
at async exitSanitizer (ext:cli/40\_test.js:97:27)
at async Object.outerWrapped \[as fn] (ext:cli/40\_test.js:124:14)
at async TestContext.step (ext:cli/40\_test.js:511:22)
at async file:///Users/stanleyzhao/Documents/Github/concept\_backend/src/concepts/Tagging/TaggingConcept.test.ts:134:3

FAILURES

Tagging Concept - Core Functionality ... Action: removeTag() => ./src/concepts/Tagging/TaggingConcept.test.ts:134:11

FAILED | 0 passed (5 steps) | 1 failed (1 step) (1s)

error: Test failed
