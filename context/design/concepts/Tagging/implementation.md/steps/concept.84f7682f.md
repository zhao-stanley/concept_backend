---
timestamp: 'Sun Oct 19 2025 17:12:05 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_171205.a41d11f3.md]]'
content_id: 84f7682f5be21e9a34176306af2535d826d335adbb3ab7564792abac2d8f29e3
---

# concept: Tagging

```
concept Tagging [Item]

purpose
    associate items with descriptive labels for organization and discovery

principle
    after tagging an item with labels,
    users can retrieve all items with specific tags or find all tags on an item

state
    a set of Tags mapping Items to sets of Strings

actions
    tag(item: Item, labels: set of Strings)
        effect:
            add or update Tags[item] to include labels

    getItemsByTag(label: String): (items: set of Items)
        effect:
            return all items that have been tagged with the specified label

    getTags(item: Item): (tags: set of Strings)
        effect:
            return all tags associated with the specified item

    removeTag(item: Item, label: String)
        requires:
            item exists in Tags
        effect:
            remove label from Tags[item]

    removeAllTags(item: Item)
        requires:
            item exists in Tags
        effect:
            remove item from Tags

```
