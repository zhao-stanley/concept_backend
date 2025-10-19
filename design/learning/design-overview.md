Interesting Things

- Sometimes the LLM just assumes something exists, such as a type.

- The LLM seems to struggle sometimes with imports and locating files properly'

- Niche details about certain tech/libraries are overlooked, such as Deno handling extensions automatically from import alias. This caused an issue for me earlier.


Using the feedback from the previous assignments about my concepts, I split the BetaVideo concept down to two generic concepts. I also removed the BoardView concept because it's not so much a concept as much as it is UI rendering logic.

Refactored concepts:

## Problem [Board, User]

```
concept Problem [Board, User]

purpose
    represent climbing routes on training boards with holds, difficulty, and movement patterns

principle
    after creating a problem on a board with specific holds and attributes,
    users can discover and attempt the problem based on its characteristics

state
    a set of Problems with
        a problemId String
        a name String
        a grade String
        a holds containing a set of Strings  // hold positions on board
        a movementTypes containing a set of Strings  // crimp, dyno, heel hook, etc.
        a board Board
        a setter User

actions
    createProblem(name: String, grade: String, holds: set of Strings,
                  movementTypes: set of Strings, board: Board, setter: User): (problem: Problem)
        effect:
            generate unique problemId
            create new problem with given attributes
            return the created problem

    getProblemsByBoard(board: Board): (problems: set of Problems)
        effect:
            return all problems on the specified board

    getProblemsByGrade(grade: String): (problems: set of Problems)
        effect:
            return all problems matching the specified grade
```

## Filter [Item]

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

## Video

```
concept Video

purpose
    store and retrieve video content from external sources

principle
    after importing a video from an external source with its URL,
    users can retrieve and view the video content

state
    a set of Videos with
        a videoId String
        a sourceType String  // "youtube", "instagram", "vimeo", etc.
        a url String
        an importTime TimeStamp

actions
    importVideo(sourceType: String, url: String): (video: Video)
        effect:
            generate unique videoId
            get current timestamp
            create new video with given sourceType, url, and importTime
            return the created video

    getVideo(videoId: String): (video: Video)
        effect:
            return the video with the specified videoId

    removeVideo(videoId: String)
        requires:
            video with videoId exists
        effect:
            remove video from Videos
```

## Tagging

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