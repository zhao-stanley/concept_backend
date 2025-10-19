---
timestamp: 'Sun Oct 19 2025 17:12:26 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_171226.5bbd608b.md]]'
content_id: fe42935434da54841b4747142969258b962496bb3f124bc8aa14fb7c95d5f2ca
---

# file: src/Tagging/TaggingConcept.ts

```typescript
import { Collection, Db, ObjectId } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

/**
 * concept Tagging [Item]
 *
 * purpose
 * associate items with descriptive labels for organization and discovery
 */
// Declare collection prefix, use concept name
const PREFIX = "Tagging" + ".";

// Generic types of this concept
type Item = ID;
type TagName = string; // Using TagName to distinguish from a potential 'Tag' entity if it were its own concept

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
   * tag(item: Item, labels: set of Strings): Empty
   *
   * **effects** add or update Tags[item] to include labels.
   *             If the item does not exist, it will be created with the given labels.
   *             If the item exists, the new labels will be added to its existing set, ensuring uniqueness.
   */
  async tag({ item, labels }: { item: Item; labels: TagName[] }): Promise<Empty> {
    if (!item) {
      return { error: "Item ID cannot be empty" };
    }
    if (!labels || labels.length === 0) {
      // If no labels are provided, consider it a no-op or an error, depending on desired behavior.
      // For now, let's treat it as no-op if item already exists, or don't create if new.
      // However, the spec implies 'include labels', so empty labels might mean remove all or add none.
      // Let's assume it means 'add these labels' so if `labels` is empty, no new labels are added.
      // A more robust design might have a dedicated 'setLabels' or handle empty `labels` explicitly.
      return {};
    }

    const uniqueLabels = [...new Set(labels)]; // Ensure uniqueness of input labels

    await this.tagsCollection.updateOne(
      { _id: item },
      { $addToSet: { labels: { $each: uniqueLabels } } }, // Add new labels to the set
      { upsert: true } // Create the document if it doesn't exist
    );

    return {};
  }

  /**
   * _getItemsByTag(label: String): (items: set of Items)
   *
   * **effects** return all items that have been tagged with the specified label
   */
  async _getItemsByTag({ label }: { label: TagName }): Promise<{ item: Item }[]> {
    if (!label) {
      return [{ error: "Tag label cannot be empty" }] as unknown as { item: Item }[]; // Casting for error return
    }

    const taggedItems = await this.tagsCollection.find(
      { labels: label },
      { projection: { _id: 1 } } // Only project the _id field
    ).toArray();

    return taggedItems.map(doc => ({ item: doc._id }));
  }

  /**
   * _getTags(item: Item): (tags: set of Strings)
   *
   * **effects** return all tags associated with the specified item
   */
  async _getTags({ item }: { item: Item }): Promise<{ tag: TagName }[]> {
    if (!item) {
      return [{ error: "Item ID cannot be empty" }] as unknown as { tag: TagName }[]; // Casting for error return
    }

    const itemDoc = await this.tagsCollection.findOne(
      { _id: item },
      { projection: { labels: 1, _id: 0 } } // Only project the labels field
    );

    if (!itemDoc || !itemDoc.labels) {
      return []; // Item not found or has no tags
    }

    return itemDoc.labels.map(tag => ({ tag: tag }));
  }

  /**
   * removeTag(item: Item, label: String): Empty
   *
   * **requires** item exists in Tags
   *
   * **effects** remove label from Tags[item]
   */
  async removeTag({ item, label }: { item: Item; label: TagName }): Promise<Empty> {
    if (!item) {
      return { error: "Item ID cannot be empty" };
    }
    if (!label) {
      return { error: "Tag label cannot be empty" };
    }

    const result = await this.tagsCollection.updateOne(
      { _id: item },
      { $pull: { labels: label } } // Remove the specific label from the array
    );

    if (result.matchedCount === 0) {
      return { error: `Item '${item}' not found or does not have tag '${label}'` };
    }

    return {};
  }

  /**
   * removeAllTags(item: Item): Empty
   *
   * **requires** item exists in Tags
   *
   * **effects** remove item from Tags (i.e., delete the document for the item)
   */
  async removeAllTags({ item }: { item: Item }): Promise<Empty> {
    if (!item) {
      return { error: "Item ID cannot be empty" };
    }

    const result = await this.tagsCollection.deleteOne({ _id: item });

    if (result.deletedCount === 0) {
      return { error: `Item '${item}' not found` };
    }

    return {};
  }
}
```
