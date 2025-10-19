## Interesting Moments:

- Sometimes the LLM just assumes something exists, such as a type.
- The LLM seems to struggle sometimes with imports and locating files properly
- [response.9921f2f1](../../context/design/concepts/Video/testing.md/steps/response.9921f2f1.md) Details get hallucinated such as video links. When generating test cases to handle videos, it generates Youtube URLs that seem potentially real but don't actually exist.
- It's quite obvious the variation/difference in response from generating each concept. Some generations are concise and focus on generating solely the code, whereas other generations have more explanation from the LLM.
- [response.13e4ba6c](../../context/design/concepts/Tagging/testing.md/steps/response.13e4ba6c.md) LLM is also susceptible to very small syntax errors that might affect the entire generation. Can definitely see how this might increase costs if you needed multiple gens to fix a small issue.

Using the feedback from the previous assignments about my concepts, I split the BetaVideo concept down to two generic concepts. I removed the BoardView concept because it's not so much a concept as much as it is UI rendering logic, as well as the Filter concept, because I think it serves more as a utility layer in the API as opposed to a concept with states. I have kept the Filter concepts and generated responses to show the process.

## Refactored concepts:

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