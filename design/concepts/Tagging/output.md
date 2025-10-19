Tagging Concept - Core Functionality ...
------- post-test output -------

--- Tagging Concept Tests ---
----- post-test output end -----
  Principle Test: Tagging and Retrieval ...
------- post-test output -------
Trace: Fulfilling the principle - after tagging an item with labels, users can retrieve all items with specific tags or find all tags on an item.
Action: tag(item: 0199fe59-3f1a-7da8-8bb4-8de1b72be004, labels: ["document", "important"])
Action: tag(item: 0199fe59-3f1a-7da8-8bb4-8de1b72be004, labels: ["urgent"])
Action: tag(item: 0199fe59-3f1a-7f14-b4f7-b20162478bd3, labels: ["important", "invoice"])
Query: _getTags(item: 0199fe59-3f1a-7da8-8bb4-8de1b72be004)
Confirmed: Tags for item 0199fe59-3f1a-7da8-8bb4-8de1b72be004 are: ["document","important","urgent"]
Query: _getItemsByTag(label: "important")
Confirmed: Items with tag 'important' are: ["0199fe59-3f1a-7da8-8bb4-8de1b72be004","0199fe59-3f1a-7f14-b4f7-b20162478bd3"]
Query: _getItemsByTag(label: "document")
Confirmed: Items with tag 'document' are: ["0199fe59-3f1a-7da8-8bb4-8de1b72be004"]
----- post-test output end -----
  Principle Test: Tagging and Retrieval ... ok (130ms)
  Action: tag() ...
------- post-test output -------

Testing tag() action.
Action: tag(item: 0199fe59-3f9e-79d7-95f4-a0a3c348099b, labels: ["new", "test"])
Action: tag(item: 0199fe59-3f9e-79d7-95f4-a0a3c348099b, labels: ["test", "another"])
Action: tag(item: "", labels: ["invalid"]) - Testing empty item ID
Action: tag(item: 0199fe59-3feb-7dac-88f1-482868b890b9, labels: []) - Testing empty labels array
----- post-test output end -----
  Action: tag() ... ok (77ms)
  Action: _getItemsByTag() ...
------- post-test output -------

Testing _getItemsByTag() query.
Query: _getItemsByTag(label: "beta")
Query: _getItemsByTag(label: "alpha")
Query: _getItemsByTag(label: "nonexistent")
Query: _getItemsByTag(label: "") - Testing empty label
----- post-test output end -----
  Action: _getItemsByTag() ... ok (93ms)
  Action: _getTags() ...
------- post-test output -------

Testing _getTags() query.
Query: _getTags(item: 0199fe59-4048-7c45-90a3-d0a652199b71)
Query: _getTags(item: 0199fe59-406e-7e82-a7c3-e3adcc3f063c) - Testing non-existent item
Query: _getTags(item: "") - Testing empty item ID
----- post-test output end -----
  Action: _getTags() ... ok (55ms)
  Action: removeTag() ...
------- post-test output -------

Testing removeTag() action.
Action: removeTag(item: 0199fe59-407f-7d2a-ba9f-f499231401d8, label: "tagB")
Action: removeTag(item: 0199fe59-407f-7d2a-ba9f-f499231401d8, label: "nonExistentTag")
Action: removeTag(item: 0199fe59-40fc-7332-86bf-64736e437208, label: "anyTag") - Testing non-existent item
Action: removeTag(item: "", label: "invalid") - Testing empty item ID
Action: removeTag(item: 0199fe59-407f-7d2a-ba9f-f499231401d8, label: "") - Testing empty label
----- post-test output end -----
  Action: removeTag() ... ok (144ms)
  Action: removeAllTags() ...
------- post-test output -------

Testing removeAllTags() action.
Action: removeAllTags(item: 0199fe59-410f-73fb-a802-29b3c0c51251)
Action: removeAllTags(item: 0199fe59-415a-7bee-a35b-d07cfc7b371d) - Testing non-existent item
Action: removeAllTags(item: "") - Testing empty item ID
----- post-test output end -----
  Action: removeAllTags() ... ok (93ms)
Tagging Concept - Core Functionality ... ok (1s)
running 0 tests from ./src/concepts/Video/VideoConcept.test.ts

ok | 1 passed (6 steps) | 0 failed (1s)