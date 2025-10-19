---
timestamp: 'Sat Oct 18 2025 23:12:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_231220.76f5cb9d.md]]'
content_id: 45739beb22079b73952ee0dc1473ef0110d8584c270b146bcf06ae7849a90577
---

# concept: Problem \[Board, User]

```
concept Problem [Board, User]

purpose
    represent climbing routes on training boards with holds, difficulty

principle
    after creating a problem on a board with specific holds and attributes,
    users can discover and attempt the problem based on its characteristics

state
    a set of Problems with
        a problemId String
        a name String
        a grade String
        a holds containing a set of Strings  // hold positions on board etc.
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
