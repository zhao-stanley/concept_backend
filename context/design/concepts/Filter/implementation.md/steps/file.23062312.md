---
timestamp: 'Sun Oct 19 2025 16:02:45 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_160245.2890efef.md]]'
content_id: 23062312d804b60721ae44acf680689fa98d09ec2270826b9df6b9c8b743c908
---

# file: src/concepts/Filter/FilterConcept.ts

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "Filter" + ".";

// Generic types of this concept
type Filter = ID;
type Item = ID; // This represents an external ID. The concept should not assume its internal properties.

/**
 * Represents the state of a Filter concept instance.
 *
 * a set of Filters with
 *   a filterId String
 *   a criteria mapping from String to set of Strings  // key-value search criteria
 */
interface FilterDocument {
  _id: Filter;
  criteria: Record<string, string[]>; // e.g., { "color": ["red", "blue"], "size": ["M"] }
}

export default class FilterConcept {
  filters: Collection<FilterDocument>;

  constructor(private readonly db: Db) {
    this.filters = this.db.collection(PREFIX + "filters");
  }

  /**
   * createFilter(): (filter: Filter)
   *
   * **requires** true
   *
   * **effects** generate unique filterId; create filter with empty criteria; return the created filter
   */
  async createFilter(): Promise<{ filter: Filter }> {
    const newFilterId = freshID();
    const newFilter: FilterDocument = {
      _id: newFilterId,
      criteria: {},
    };
    await this.filters.insertOne(newFilter);
    return { filter: newFilterId };
  }

  /**
   * addCriteria(filter: Filter, key: String, values: set of Strings)
   *
   * **requires** filter exists
   *
   * **effects** add or update criteria[key] = values in filter
   */
  async addCriteria(
    { filter, key, values }: { filter: Filter; key: string; values: string[] },
  ): Promise<Empty | { error: string }> {
    const existingFilter = await this.filters.findOne({ _id: filter });
    if (!existingFilter) {
      return { error: `Filter with ID '${filter}' not found.` };
    }

    // Update the criteria for the specified key using MongoDB's dot notation
    await this.filters.updateOne(
      { _id: filter },
      { $set: { [`criteria.${key}`]: values } },
    );

    return {};
  }

  /**
   * search(filter: Filter, items: set of Items): (results: set of Items)
   *
   * **requires** filter exists
   *
   * **effects** return items that match all criteria in filter
   */
  async search(
    { filter, items }: { filter: Filter; items: Item[] },
  ): Promise<{ results: Item[] } | { error: string }> {
    const existingFilter = await this.filters.findOne({ _id: filter });
    if (!existingFilter) {
      return { error: `Filter with ID '${filter}' not found.` };
    }

    const { criteria } = existingFilter;

    // --- CRITICAL DESIGN PROBLEM NOTED HERE ---
    // The 'Item' type parameter is defined as ID (a polymorphic identifier),
    // meaning the 'Filter' concept should not assume any properties about the items themselves.
    // However, the 'effects' of the `search` action state "return items that match all criteria in filter".
    // This implies that the 'Filter' concept *must* be able to inspect properties of 'Item's
    // (e.g., properties like "color" or "size" to match against the `criteria` keys).
    //
    // Implementing this strictly as per the concept's polymorphism rule for 'Item'
    // would mean this action cannot actually perform property-based filtering on an
    // arbitrary `ID[]` input because it has no access to the `Item`s' properties.
    //
    // A more appropriate design, adhering to concept independence and polymorphism,
    // would be for `search` to return the criteria, and a `sync` to apply these
    // criteria to an external concept that *does* manage item properties.
    // Alternatively, the `items` argument could explicitly include the necessary properties
    // for filtering (e.g., `items: Array<{ id: Item, properties: Record<string, string | string[]> }>`),
    // but this would change the specified signature and make `Item` in this context
    // a more complex type than just `ID`.
    //
    // For the sake of providing an implementation that aligns with the *intended* `effects`
    // of filtering, we proceed with the assumption that the `items` array provided
    // *implicitly contains* the properties necessary for matching against the `criteria`.
    // This means we treat `items` as `Array<{ _id: Item, [key: string]: string | string[] }>`,
    // effectively performing a type assertion `items as unknown as ItemWithProperties[]`.
    // This *does* deviate from the strict `Item = ID` polymorphic type parameter.
    // If the input `items` were strictly `ID[]`, this `search` logic would be impossible
    // to fulfill the stated effects.
    // --- END CRITICAL DESIGN PROBLEM NOTE ---

    // Define a type for items assuming they have properties for filtering
    type ItemWithProperties = { _id: Item; [key: string]: string | string[] };
    // Type assertion to allow property access for demonstration purposes
    const itemsWithProperties = items as unknown as ItemWithProperties[]; 

    const matchingItems: Item[] = [];

    // If no criteria are defined, all items match
    if (Object.keys(criteria).length === 0) {
      return { results: items };
    }

    for (const item of itemsWithProperties) {
      let matchesAllCriteria = true;
      for (const criterionKey in criteria) {
        if (Object.prototype.hasOwnProperty.call(criteria, criterionKey)) {
          const requiredValues = criteria[criterionKey];
          const itemProperty = item[criterionKey];

          // If item doesn't have the property or it's null/undefined, it doesn't match this criterion
          if (itemProperty === undefined || itemProperty === null) {
            matchesAllCriteria = false;
            break;
          }

          // Ensure itemProperty is an array of strings for consistent comparison
          const itemValues = Array.isArray(itemProperty)
            ? itemProperty.map(String)
            : [String(itemProperty)];

          // If no specific values are required for this key (empty array in criteria),
          // this criterion is considered met for the item.
          let hasMatchForKey = true;
          if (requiredValues.length > 0) {
            hasMatchForKey = requiredValues.some((requiredVal) =>
              itemValues.includes(requiredVal)
            );
          }
          
          if (!hasMatchForKey) {
            matchesAllCriteria = false;
            break;
          }
        }
      }
      if (matchesAllCriteria) {
        matchingItems.push(item._id);
      }
    }

    return { results: matchingItems };
  }

  /**
   * clearFilter(filter: Filter)
   *
   * **requires** filter exists
   *
   * **effects** remove all criteria from filter
   */
  async clearFilter(
    { filter }: { filter: Filter },
  ): Promise<Empty | { error: string }> {
    const existingFilter = await this.filters.findOne({ _id: filter });
    if (!existingFilter) {
      return { error: `Filter with ID '${filter}' not found.` };
    }

    await this.filters.updateOne(
      { _id: filter },
      { $set: { criteria: {} } }, // Set criteria to an empty object
    );

    return {};
  }
}
```
