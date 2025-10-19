---
timestamp: 'Sun Oct 19 2025 16:01:35 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_160135.c30f8d67.md]]'
content_id: 694c24e355f0f8aa9760abc45c951c0b3ed26ec3d2d96476d715c99c220e032e
---

# concept: Filter \[Item]

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
