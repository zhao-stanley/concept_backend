---
timestamp: 'Sun Oct 19 2025 17:20:57 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_172057.66f7b03d.md]]'
content_id: 713ef6c0dd340028d295f4a8bd3c804328888c263d4bcd43db24a3de383aad62
---

# file: src/Tagging/TaggingConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";

/**
 * concept Tagging [Item]
 *
 * purpose
 * associate items with descriptive labels for organization and discovery
 *
 * principle
 * after tagging an item with labels,
 * users can retrieve all items with specific tags or find all tags on an item
 */
// Declare collection prefix, use concept name
const PREFIX = "Tagging" + ".";

// Generic types of this concept
type Item = ID;
type TagName = string; // Represents the string value of a tag

/**
 * state
 * a set of Tags mapping Items to sets of Strings
 *
 * Represents the mapping from an Item to the set of TagNames associated with it.
 */
interface ItemTags {
  _id: Item; // The ID of the item being tagged
  labels: TagName[]; // The set of tags (strings) associated with this item
}

export default class TaggingConcept {
  private tagsCollection: Collection<ItemTags>;

  constructor(private readonly db: Db) {
    this.tagsCollection = this.db.collection(PREFIX + "item_tags");
  }

  /**
   * tag(item: Item, labels: set of Strings): Empty | { error: string }
   *
   * **effects** add or update Tags[item] to include labels.
   *             If the item does not exist, it will be created with the given labels.
   *             If the item exists, the new labels will be added to its existing set, ensuring uniqueness.
   */
  async tag({ item, labels }: { item: Item; labels: TagName[] }): Promise<Empty | { error: string }> {
    if (!item) {
      return { error: "Item ID cannot be empty" };
    }
    if (!labels || labels.length === 0) {
      // Per the spec, 'labels' is a 'set of Strings'. An empty set implies no labels to add.
      // If we are strictly 'adding', then an empty set means nothing to add.
      // If the intent was to *replace* all tags, a separate action would be needed.
      // For 'add or update...to include labels', an empty 'labels' set means no *new* labels are included.
      return {};
    }

    const uniqueLabels = [...new Set(labels)]; // Ensure uniqueness of input labels before adding

    try {
      await this.tagsCollection.updateOne(
        { _id: item },
        { $addToSet: { labels: { $each: uniqueLabels } } }, // Add new labels to the set
        { upsert: true } // Create the document if it doesn't exist
      );
    } catch (e: unknown) { // Fixed: Catch e as unknown
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`Error tagging item ${item} with labels ${labels}: ${errorMessage}`);
      return { error: `Failed to tag item: ${errorMessage}` };
    }

    return {};
  }

  /**
   * _getItemsByTag(label: String): (items: set of Items) | { error: string }[]
   *
   * **effects** return all items that have been tagged with the specified label
   */
  async _getItemsByTag({ label }: { label: TagName }): Promise<{ item: Item }[] | { error: string }[]> {
    if (!label) {
      return [{ error: "Tag label cannot be empty" }];
    }

    try {
      const taggedItems = await this.tagsCollection.find(
        { labels: label },
        { projection: { _id: 1 } } // Only project the _id field
      ).toArray();

      return taggedItems.map(doc => ({ item: doc._id }));
    } catch (e: unknown) { // Fixed: Catch e as unknown
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`Error getting items by tag ${label}: ${errorMessage}`);
      return [{ error: `Failed to retrieve items by tag: ${errorMessage}` }];
    }
  }

  /**
   * _getTags(item: Item): (tags: set of Strings) | { error: string }[]
   *
   * **effects** return all tags associated with the specified item
   */
  async _getTags({ item }: { item: Item }): Promise<{ tag: TagName }[] | { error: string }[]> {
    if (!item) {
      return [{ error: "Item ID cannot be empty" }];
    }

    try {
      const itemDoc = await this.tagsCollection.findOne(
        { _id: item },
        { projection: { labels: 1, _id: 0 } } // Only project the labels field
      );

      if (!itemDoc || !itemDoc.labels) {
        return []; // Item not found or has no tags
      }

      return itemDoc.labels.map(tag => ({ tag: tag }));
    } catch (e: unknown) { // Fixed: Catch e as unknown
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`Error getting tags for item ${item}: ${errorMessage}`);
      return [{ error: `Failed to retrieve tags for item: ${errorMessage}` }];
    }
  }

  /**
   * removeTag(item: Item, label: String): Empty | { error: string }
   *
   * **requires** item exists in Tags
   *
   * **effects** remove label from Tags[item]
   */
  async removeTag({ item, label }: { item: Item; label: TagName }): Promise<Empty | { error: string }> {
    if (!item) {
      return { error: "Item ID cannot be empty" };
    }
    if (!label) {
      return { error: "Tag label cannot be empty" };
    }

    try {
      const result = await this.tagsCollection.updateOne(
        { _id: item },
        { $pull: { labels: label } } // Remove the specific label from the array
      );

      // Check if the item existed (matchedCount > 0) AND if a label was actually removed (modifiedCount > 0).
      if (result.matchedCount === 0) {
        // Item did not exist, violating 'requires'.
        return { error: `Item '${item}' not found.` };
      } else if (result.modifiedCount === 0) {
        // Item existed, but the specific label was not found in its array to be pulled.
        // This means the 'effect' of removing the label did not occur because it wasn't there.
        return { error: `Item '${item}' exists, but does not have tag '${label}' to remove.` };
      }
      // If matchedCount is 1 and modifiedCount is 1, then the operation was successful.
    } catch (e: unknown) { // Fixed: Catch e as unknown
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`Error removing tag '${label}' from item '${item}': ${errorMessage}`);
      return { error: `Failed to remove tag: ${errorMessage}` };
    }

    return {};
  }

  /**
   * removeAllTags(item: Item): Empty | { error: string }
   *
   * **requires** item exists in Tags
   *
   * **effects** remove item from Tags (i.e., delete the document for the item)
   */
  async removeAllTags({ item }: { item: Item }): Promise<Empty | { error: string }> {
    if (!item) {
      return { error: "Item ID cannot be empty" };
    }

    try {
      const result = await this.tagsCollection.deleteOne({ _id: item });

      if (result.deletedCount === 0) {
        return { error: `Item '${item}' not found` };
      }
    } catch (e: unknown) { // Fixed: Catch e as unknown
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error(`Error removing all tags for item '${item}': ${errorMessage}`);
      return { error: `Failed to remove all tags: ${errorMessage}` };
    }

    return {};
  }
}
```

With this change, when `removeTag` is called with a non-existent tag on an existing item, it will now return `{ error: "Item '...' exists, but does not have tag '...' to remove." }`, which is an object and thus not equal to `{}`, satisfying your `assertNotEquals` assertion.

Your `TaggingConcept.test.ts` file is now correct and should pass all tests with the updated `TaggingConcept.ts`.
