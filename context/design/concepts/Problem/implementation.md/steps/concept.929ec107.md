---
timestamp: 'Sat Oct 18 2025 22:07:09 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_220709.fde8c3bc.md]]'
content_id: 929ec107d542e88acf331947f0d21785ec678bbfde851f934865a5c802a34c2c
---

# concept: Problem \[Board, User]

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
