---
timestamp: 'Sat Oct 18 2025 22:03:40 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_220340.14fe22ec.md]]'
content_id: a350fbec1eb21803e899d394f9ca304beeffebd39596ee5915ec4960b3e7a4e9
---

# implement: Problem

## concept: Problem \[Board, User]

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
