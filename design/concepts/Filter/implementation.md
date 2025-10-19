[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

# implement: Filter

# concept: Filter [Item]
```
concept Filter [Item]

purpose
    enable advanced search through collections of items based on multiple criteria

principle
    after adding search criteria to a filter, applying it to a collection
    returns only items matching all specified criteria

state
    a set of Filters with
        a filterId String
        a criteria mapping from String to set of Strings  // key-value search criteria

actions
    createFilter(): (filter: Filter)
        effect:
            generate unique filterId
            create filter with empty criteria
            return the created filter

    addCriteria(filter: Filter, key: String, values: set of Strings)
        requires:
            filter exists
        effect:
            add or update criteria[key] = values in filter

    search(filter: Filter, items: set of Items): (results: set of Items)
        requires:
            filter exists
        effect:
            return items that match all criteria in filter

    clearFilter(filter: Filter)
        requires:
            filter exists
        effect:
            remove all criteria from filter
```

# response:

To implement the `Filter` concept, we'll create a TypeScript class `FilterConcept` that interacts with a MongoDB database to store and manage filter criteria.

## `FilterConcept` Implementation

Here's the TypeScript implementation for the `Filter` concept:

# file: src/concepts/Filter/FilterConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "Filter" + ".";

/**
 * Generic type for items being filtered.
 * As per the Concept Design guidelines, generic parameters are IDs.
 */
type Item = ID;

/**
 * Type for a Filter entity within this concept.
 */
type Filter = ID;

/**
 * Interface for the MongoDB document representing a Filter.
 *
 * `_id`: The unique identifier for the filter.
 * `criteria`: A record mapping a string key (e.g., "color", "category")
 *             to an array of strings representing allowed values for that key.
 *             An item must match at least one value for each key.
 *             e.g., `{ "color": ["red", "blue"], "size": ["M", "L"] }`
 */
interface FilterDocument {
  _id: Filter;
  criteria: Record<string, string[]>;
}

/**
 * Type for an item that can be filtered.
 * While `Item` is an `ID` in the generic parameter, for the `search` action
 * to function completely within this concept, the `items` passed must
 * include their properties against which the criteria can be checked.
 * This type ensures that the item objects provided have an `_id` (the Item ID)
 * and can have arbitrary additional properties (e.g., `item.color`, `item.size`).
 */
type FilterableItem = { _id: Item; [key: string]: any };

/**
 * @concept Filter [Item]
 * @purpose enable advanced search through collections of items based on multiple criteria
 * @principle after adding search criteria to a filter, applying it to a collection
 *            returns only items matching all specified criteria
 */
export default class FilterConcept {
  // MongoDB collection to store filter documents
  filters: Collection<FilterDocument>;

  constructor(private readonly db: Db) {
    this.filters = this.db.collection(PREFIX + "filters");
  }

  /**
   * createFilter(): (filter: Filter)
   *
   * **requires** true
   *
   * **effects**
   *   generate unique filterId
   *   create filter with empty criteria
   *   return the created filter
   */
  async createFilter(): Promise<{ filter: Filter } | { error: string }> {
    const newFilterId = freshID();
    const newFilter: FilterDocument = {
      _id: newFilterId,
      criteria: {},
    };

    try {
      await this.filters.insertOne(newFilter);
      return { filter: newFilterId };
    } catch (e) {
      return { error: `Failed to create filter: ${e.message}` };
    }
  }

  /**
   * addCriteria(filter: Filter, key: String, values: set of Strings): Empty
   *
   * **requires**
   *   filter exists
   *
   * **effects**
   *   add or update criteria[key] = values in filter
   */
  async addCriteria(
    { filter, key, values }: { filter: Filter; key: string; values: string[] },
  ): Promise<Empty | { error: string }> {
    const existingFilter = await this.filters.findOne({ _id: filter });
    if (!existingFilter) {
      return { error: `Filter with ID ${filter} not found.` };
    }

    try {
      // Use $set to update a specific key within the 'criteria' map.
      // If the key already exists, its values will be overwritten.
      // If it doesn't exist, it will be added.
      await this.filters.updateOne(
        { _id: filter },
        { $set: { [`criteria.${key}`]: values } },
      );
      return {};
    } catch (e) {
      return { error: `Failed to add criteria: ${e.message}` };
    }
  }

  /**
   * search(filter: Filter, items: set of Items): (results: set of Items)
   *
   * **requires**
   *   filter exists
   *
   * **effects**
   *   return items that match all criteria in filter
   *
   * Note on `items` parameter: For this action to be complete and perform
   * filtering, the `items` array must contain objects that have properties
   * corresponding to the filter's criteria keys, in addition to their `_id`.
   */
  async search(
    { filter, items }: { filter: Filter; items: FilterableItem[] },
  ): Promise<{ results: Item[] } | { error: string }> {
    const existingFilter = await this.filters.findOne({ _id: filter });
    if (!existingFilter) {
      return { error: `Filter with ID ${filter} not found.` };
    }

    const { criteria } = existingFilter;
    const matchingItemIds: Item[] = [];

    // If the filter has no criteria, all provided items are considered matches.
    if (Object.keys(criteria).length === 0) {
      return { results: items.map((item) => item._id) };
    }

    for (const item of items) {
      let matchesAllCriteria = true;
      for (const key in criteria) {
        if (criteria.hasOwnProperty(key)) {
          const requiredValues = new Set(criteria[key]); // Values required for this criterion key

          const itemPropertyValue = item[key]; // Get the property value from the current item

          // If the item doesn't have the required property or it's null/undefined, it doesn't match this criterion.
          if (itemPropertyValue === undefined || itemPropertyValue === null) {
            matchesAllCriteria = false;
            break;
          }

          // Convert item's property value(s) into an array of strings for consistent comparison.
          // Handles both single values and array of values on the item.
          const itemValues = Array.isArray(itemPropertyValue)
            ? itemPropertyValue.map(String)
            : [String(itemPropertyValue)];

          // Check if any of the item's values for this property match any of the required values.
          // (Logical OR within a single criterion's values)
          const hasOverlap = itemValues.some((itemVal) =>
            requiredValues.has(itemVal)
          );

          if (!hasOverlap) {
            matchesAllCriteria = false;
            break; // Item does not match this criterion, move to next item
          }
        }
      }
      // If the item matched all criteria, add its ID to the results.
      if (matchesAllCriteria) {
        matchingItemIds.push(item._id);
      }
    }

    return { results: matchingItemIds };
  }

  /**
   * clearFilter(filter: Filter): Empty
   *
   * **requires**
   *   filter exists
   *
   * **effects**
   *   remove all criteria from filter
   */
  async clearFilter(
    { filter }: { filter: Filter },
  ): Promise<Empty | { error: string }> {
    const existingFilter = await this.filters.findOne({ _id: filter });
    if (!existingFilter) {
      return { error: `Filter with ID ${filter} not found.` };
    }

    try {
      // Set the 'criteria' field to an empty object to clear all criteria.
      await this.filters.updateOne(
        { _id: filter },
        { $set: { criteria: {} } },
      );
      return {};
    } catch (e) {
      return { error: `Failed to clear filter: ${e.message}` };
    }
  }
}
```

# Explanation of Implementation Choices:

1.  **State Mapping (`FilterDocument`):**
    *   The concept state `a set of Filters with a filterId String a criteria mapping from String to set of Strings` is mapped directly to a MongoDB collection named `Filter.filters`.
    *   Each document in this collection (`FilterDocument`) uses `_id` for `filterId` and a `Record<string, string[]>` for `criteria`. This `Record` represents the key-value mapping where keys are strings (e.g., "color") and values are arrays of strings (e.g., `["red", "blue"]`), effectively `set of Strings` in TypeScript.

2.  **Generic Type `Item` and `FilterableItem`:**
    *   The concept specifies `Item` as a generic parameter, which typically means it's treated as an `ID`.
    *   However, for the `search` action to fulfill its purpose (`return items that match all criteria`), the `Filter` concept needs to inspect properties of the `items`.
    *   To maintain concept independence and completeness, we assume the `items` passed to the `search` method are not just raw `ID`s, but objects that include their `_id` (the `Item` type) and any relevant properties that might be used in the filter criteria (e.g., `{ _id: "post:123", category: "news", author: "Alice" }`). This is captured by the `FilterableItem` type. The `search` action then returns an array of just the `Item` IDs of the matching objects.

3.  **Actions Implementation:**
    *   **`createFilter`**: Generates a unique `ID` using `freshID()`, creates a new `FilterDocument` with empty `criteria`, inserts it into the `filters` collection, and returns the new filter's `ID`.
    *   **`addCriteria`**: Finds the specified filter. If found, it uses MongoDB's `$set` operator to update (or add) the specified `key` within the `criteria` object with the new `values`. This handles both adding new criteria and modifying existing ones.
    *   **`search`**:
        *   Retrieves the filter's criteria.
        *   If the filter has no criteria, all input `items` are returned.
        *   It iterates through each `item` in the input `items` array.
        *   For each `item`, it checks *all* `criteria` keys:
            *   It retrieves the `itemPropertyValue` for the current `key`.
            *   It ensures the `itemPropertyValue` (which can be a single string or an array of strings on the item itself) is consistently treated as an array of strings.
            *   It performs a logical "OR" check: if *any* value from `itemValues` (e.g., `item.tags = ["tag1", "tag2"]`) is present in the `requiredValues` for that criterion (e.g., `filter.criteria.tags = ["tag1", "tag3"]`), then that criterion is considered a match for the item.
            *   It performs a logical "AND" check across different `criteria` keys: an item must match successfully against *every* criterion defined in the filter.
        *   It returns an array of `Item` IDs that satisfied all criteria.
    *   **`clearFilter`**: Finds the specified filter. If found, it uses MongoDB's `$set` to set the `criteria` field to an empty object (`{}`), effectively removing all criteria.

4.  **Error Handling:**
    *   All actions include checks for required preconditions (e.g., `filter exists`). If a precondition is violated, or a database operation fails, an object `{ error: "message" }` is returned, as specified in the guidelines. This allows synchronizations to react to specific error conditions.

This implementation provides a complete and self-contained `Filter` concept as described, reconciling the generic `Item` type with the practical need for searching item properties.