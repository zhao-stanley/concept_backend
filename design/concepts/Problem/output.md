Problem Concept Tests ...
  Test: createProblem - successful creation ...
------- post-test output -------

--- Testing createProblem (Success) ---
Action: createProblem with name: 'Crimpy Traverse', board: 'board:trainingBoardA', setter: 'user:Alice'
Effect: Created problem with ID: '0199fab1-7181-7140-95f8-a24da87d3bc7'
Action: createProblem returned: { problem: "0199fab1-7181-7140-95f8-a24da87d3bc7" }
Action: getProblemsByBoard for board: 'board:trainingBoardA'
Effect: Found 1 problems for board: 'board:trainingBoardA'
Action: getProblemsByBoard(board:trainingBoardA) returned: {
  problems: [
    {
      _id: "0199fab1-7181-7140-95f8-a24da87d3bc7",
      name: "Crimpy Traverse",
      grade: "V7",
      holds: [ "H1", "H5", "H10", "H11", "H15" ],
      board: "board:trainingBoardA",
      setter: "user:Alice"
    }
  ]
}
Verification successful: Problem created and retrieved with correct details.
----- post-test output end -----
  Test: createProblem - successful creation ... ok (54ms)
  Test: createProblem - another successful creation ...
------- post-test output -------

--- Testing createProblem (Another Success) ---
Action: createProblem with name: 'Slabby Balancy', board: 'board:trainingBoardA', setter: 'user:Bob'
Effect: Created problem with ID: '0199fab1-71b7-7a52-b8c3-f6d32782eba6'
Action: createProblem returned: { problem: "0199fab1-71b7-7a52-b8c3-f6d32782eba6" }
Action: getProblemsByBoard for board: 'board:trainingBoardA'
Effect: Found 2 problems for board: 'board:trainingBoardA'
Action: getProblemsByBoard(board:trainingBoardA) returned: {
  problems: [
    {
      _id: "0199fab1-7181-7140-95f8-a24da87d3bc7",
      name: "Crimpy Traverse",
      grade: "V7",
      holds: [ "H1", "H5", "H10", "H11", "H15" ],
      board: "board:trainingBoardA",
      setter: "user:Alice"
    },
    {
      _id: "0199fab1-71b7-7a52-b8c3-f6d32782eba6",
      name: "Slabby Balancy",
      grade: "V3",
      holds: [ "S1", "S2", "S3" ],
      board: "board:trainingBoardA",
      setter: "user:Bob"
    }
  ]
}
Verification successful: Second problem created.
----- post-test output end -----
  Test: createProblem - another successful creation ... ok (37ms)
  Test: createProblem - validation errors ...
------- post-test output -------

--- Testing createProblem (Validation Errors) ---
Testing invalid case: Problem name cannot be empty.
Action: createProblem with name: '', board: 'board:trainingBoardA', setter: 'user:Alice'
Validation Error: Problem name cannot be empty.
Action: createProblem returned: { error: "Problem name cannot be empty." }
Testing invalid case: Problem grade cannot be empty.
Action: createProblem with name: 'Test Problem', board: 'board:trainingBoardA', setter: 'user:Alice'
Validation Error: Problem grade cannot be empty.
Action: createProblem returned: { error: "Problem grade cannot be empty." }
Testing invalid case: Problem must have at least one hold position.
Action: createProblem with name: 'Test Problem', board: 'board:trainingBoardA', setter: 'user:Alice'
Validation Error: Problem must have at least one hold position.
Action: createProblem returned: { error: "Problem must have at least one hold position." }
Testing invalid case: Problem must be associated with a board ID.
Action: createProblem with name: 'Test Problem', board: '', setter: 'user:Alice'
Validation Error: Problem must be associated with a board ID.
Action: createProblem returned: { error: "Problem must be associated with a board ID." }
Testing invalid case: Problem must have a setter (User ID).
Action: createProblem with name: 'Test Problem', board: 'board:trainingBoardA', setter: ''
Validation Error: Problem must have a setter (User ID).
Action: createProblem returned: { error: "Problem must have a setter (User ID)." }
Verification successful: createProblem handles validation errors correctly.
----- post-test output end -----
  Test: createProblem - validation errors ... ok (1ms)
  Test: getProblemsByBoard - retrieves correct problems ...
------- post-test output -------

--- Testing getProblemsByBoard (Retrieval) ---
Action: getProblemsByBoard for board: 'board:trainingBoardA'
Effect: Found 2 problems for board: 'board:trainingBoardA'
Action: getProblemsByBoard(board:trainingBoardA) returned: {
  problems: [
    {
      _id: "0199fab1-7181-7140-95f8-a24da87d3bc7",
      name: "Crimpy Traverse",
      grade: "V7",
      holds: [ "H1", "H5", "H10", "H11", "H15" ],
      board: "board:trainingBoardA",
      setter: "user:Alice"
    },
    {
      _id: "0199fab1-71b7-7a52-b8c3-f6d32782eba6",
      name: "Slabby Balancy",
      grade: "V3",
      holds: [ "S1", "S2", "S3" ],
      board: "board:trainingBoardA",
      setter: "user:Bob"
    }
  ]
}
Action: createProblem with name: 'Dyno Monster', board: 'board:compWallB', setter: 'user:Alice'
Effect: Created problem with ID: '0199fab1-71ee-7f44-ba8f-dddeea278e10'
Action: createProblem (Dyno Monster) returned: { problem: "0199fab1-71ee-7f44-ba8f-dddeea278e10" }
Action: getProblemsByBoard for board: 'board:compWallB'
Effect: Found 1 problems for board: 'board:compWallB'
Action: getProblemsByBoard(board:compWallB) returned: {
  problems: [
    {
      _id: "0199fab1-71ee-7f44-ba8f-dddeea278e10",
      name: "Dyno Monster",
      grade: "V9",
      holds: [ "D1", "D2" ],
      board: "board:compWallB",
      setter: "user:Alice"
    }
  ]
}
Action: getProblemsByBoard for board: 'board:trainingBoardA'
Effect: Found 2 problems for board: 'board:trainingBoardA'
Action: getProblemsByBoard(board:trainingBoardA) after boardB add returned: {
  problems: [
    {
      _id: "0199fab1-7181-7140-95f8-a24da87d3bc7",
      name: "Crimpy Traverse",
      grade: "V7",
      holds: [ "H1", "H5", "H10", "H11", "H15" ],
      board: "board:trainingBoardA",
      setter: "user:Alice"
    },
    {
      _id: "0199fab1-71b7-7a52-b8c3-f6d32782eba6",
      name: "Slabby Balancy",
      grade: "V3",
      holds: [ "S1", "S2", "S3" ],
      board: "board:trainingBoardA",
      setter: "user:Bob"
    }
  ]
}
Verification successful: getProblemsByBoard filters by board correctly.
----- post-test output end -----
  Test: getProblemsByBoard - retrieves correct problems ... ok (76ms)
  Test: getProblemsByBoard - no problems found ...
------- post-test output -------

--- Testing getProblemsByBoard (No Results) ---
Action: getProblemsByBoard for board: 'board:nonExistent'
Effect: Found 0 problems for board: 'board:nonExistent'
Action: getProblemsByBoard for non-existent board returned: { problems: [] }
Verification successful: getProblemsByBoard returns empty for no match.
----- post-test output end -----
  Test: getProblemsByBoard - no problems found ... ok (18ms)
  Test: getProblemsByBoard - validation errors ...
------- post-test output -------

--- Testing getProblemsByBoard (Validation Errors) ---
Action: getProblemsByBoard for board: ''
Validation Error: Board ID cannot be empty for getProblemsByBoard.
Action: getProblemsByBoard for empty board ID returned: { error: "Board ID cannot be empty." }
Verification successful: getProblemsByBoard handles validation errors.
----- post-test output end -----
  Test: getProblemsByBoard - validation errors ... ok (0ms)
  Test: getProblemsByGrade - retrieves correct problems ...
------- post-test output -------

--- Testing getProblemsByGrade (Retrieval) ---
Action: getProblemsByGrade for grade: 'V7'
Effect: Found 1 problems for grade: 'V7'
Action: getProblemsByGrade(V7) returned: {
  problems: [
    {
      _id: "0199fab1-7181-7140-95f8-a24da87d3bc7",
      name: "Crimpy Traverse",
      grade: "V7",
      holds: [ "H1", "H5", "H10", "H11", "H15" ],
      board: "board:trainingBoardA",
      setter: "user:Alice"
    }
  ]
}
Action: getProblemsByGrade for grade: 'V3'
Effect: Found 1 problems for grade: 'V3'
Action: getProblemsByGrade(V3) returned: {
  problems: [
    {
      _id: "0199fab1-71b7-7a52-b8c3-f6d32782eba6",
      name: "Slabby Balancy",
      grade: "V3",
      holds: [ "S1", "S2", "S3" ],
      board: "board:trainingBoardA",
      setter: "user:Bob"
    }
  ]
}
Action: getProblemsByGrade for grade: 'V9'
Effect: Found 1 problems for grade: 'V9'
Action: getProblemsByGrade(V9) returned: {
  problems: [
    {
      _id: "0199fab1-71ee-7f44-ba8f-dddeea278e10",
      name: "Dyno Monster",
      grade: "V9",
      holds: [ "D1", "D2" ],
      board: "board:compWallB",
      setter: "user:Alice"
    }
  ]
}
Verification successful: getProblemsByGrade filters by grade correctly.
----- post-test output end -----
  Test: getProblemsByGrade - retrieves correct problems ... ok (55ms)
  Test: getProblemsByGrade - no problems found ...
------- post-test output -------

--- Testing getProblemsByGrade (No Results) ---
Action: getProblemsByGrade for grade: 'V100'
Effect: Found 0 problems for grade: 'V100'
Action: getProblemsByGrade for non-existent grade returned: { problems: [] }
Verification successful: getProblemsByGrade returns empty for no match.
----- post-test output end -----
  Test: getProblemsByGrade - no problems found ... ok (18ms)
  Test: getProblemsByGrade - validation errors ...
------- post-test output -------

--- Testing getProblemsByGrade (Validation Errors) ---
Action: getProblemsByGrade for grade: ''
Validation Error: Grade cannot be empty for getProblemsByGrade.
Action: getProblemsByGrade for empty grade string returned: { error: "Grade cannot be empty." }
Verification successful: getProblemsByGrade handles validation errors.
----- post-test output end -----
  Test: getProblemsByGrade - validation errors ... ok (0ms)
  Test: Principle fulfillment - Discover and attempt problems ...
------- post-test output -------

--- Testing Principle Fulfillment ---
Principle: after creating a problem on a board with specific holds and attributes, users can discover and attempt the problem based on its characteristics
Trace Step 1: Creating multiple problems on different boards and grades.
Action: createProblem with name: 'Basic Warmup', board: 'board:trainingBoardA', setter: 'user:Alice'
Effect: Created problem with ID: '0199fab1-7284-7b0e-a25a-9d79f667ffb3'
Action: createProblem (Basic Warmup) returned: { problem: "0199fab1-7284-7b0e-a25a-9d79f667ffb3" }
Action: createProblem with name: 'Techy Corner', board: 'board:trainingBoardA', setter: 'user:Bob'
Effect: Created problem with ID: '0199fab1-7298-767f-b497-8b7aff2c82f0'
Action: createProblem (Techy Corner) returned: { problem: "0199fab1-7298-767f-b497-8b7aff2c82f0" }
Action: createProblem with name: 'Power Traverse', board: 'board:compWallB', setter: 'user:Alice'
Effect: Created problem with ID: '0199fab1-72ac-7380-a143-0a3e494dc89a'
Action: createProblem (Power Traverse) returned: { problem: "0199fab1-72ac-7380-a143-0a3e494dc89a" }
Trace Step 2: Discovering problems on Board 'board:trainingBoardA'.
Action: getProblemsByBoard for board: 'board:trainingBoardA'
Effect: Found 4 problems for board: 'board:trainingBoardA'
Action: getProblemsByBoard(board:trainingBoardA) returned: {
  problems: [
    {
      _id: "0199fab1-7181-7140-95f8-a24da87d3bc7",
      name: "Crimpy Traverse",
      grade: "V7",
      holds: [ "H1", "H5", "H10", "H11", "H15" ],
      board: "board:trainingBoardA",
      setter: "user:Alice"
    },
    {
      _id: "0199fab1-71b7-7a52-b8c3-f6d32782eba6",
      name: "Slabby Balancy",
      grade: "V3",
      holds: [ "S1", "S2", "S3" ],
      board: "board:trainingBoardA",
      setter: "user:Bob"
    },
    {
      _id: "0199fab1-7284-7b0e-a25a-9d79f667ffb3",
      name: "Basic Warmup",
      grade: "V1",
      holds: [ "J1", "J2", "J3" ],
      board: "board:trainingBoardA",
      setter: "user:Alice"
    },
    {
      _id: "0199fab1-7298-767f-b497-8b7aff2c82f0",
      name: "Techy Corner",
      grade: "V4",
      holds: [ "K1", "K2", "K3", "K4" ],
      board: "board:trainingBoardA",
      setter: "user:Bob"
    }
  ]
}
Found problems on Board A: Crimpy Traverse, Slabby Balancy, Basic Warmup, Techy Corner
Trace Step 3: Discovering problems with Grade 'V4'.
Action: getProblemsByGrade for grade: 'V4'
Effect: Found 2 problems for grade: 'V4'
Action: getProblemsByGrade(V4) returned: {
  problems: [
    {
      _id: "0199fab1-7298-767f-b497-8b7aff2c82f0",
      name: "Techy Corner",
      grade: "V4",
      holds: [ "K1", "K2", "K3", "K4" ],
      board: "board:trainingBoardA",
      setter: "user:Bob"
    },
    {
      _id: "0199fab1-72ac-7380-a143-0a3e494dc89a",
      name: "Power Traverse",
      grade: "V4",
      holds: [ "L1", "L2", "L3" ],
      board: "board:compWallB",
      setter: "user:Alice"
    }
  ]
}
Found problems with Grade V4: Techy Corner, Power Traverse
Principle fulfillment demonstrated: Problems are created and can be discovered by board and grade.
----- post-test output end -----
  Test: Principle fulfillment - Discover and attempt problems ... ok (96ms)
Problem Concept Tests ... ok (895ms)
running 0 tests from ./src/concepts/Video/VideoConcept.test.ts

ok | 1 passed (10 steps) | 0 failed (1s)