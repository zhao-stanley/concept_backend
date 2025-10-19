---
timestamp: 'Sat Oct 18 2025 23:12:20 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_231220.76f5cb9d.md]]'
content_id: 5a11ad2de9883fca9c129ac933d92230ffaf649315a78b08aa5b6d9ccd5c18ea
---

# response:

```typescript
// file: src/concepts/Problem/ProblemConcept.ts

import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "Problem" + ".";

// Generic types of this concept, treated polymorphically (as IDs)
type Board = ID;
type User = ID;
type Problem = ID; // The unique identifier for a Problem instance

/**
 * concept Problem [Board, User]
 *
 * purpose: represent climbing routes on training boards with holds, difficulty, and movement patterns
 *
 * principle: after creating a problem on a board with specific holds and attributes,
 * users can discover and attempt the problem based on its characteristics
 */

/**
 * state:
 * a set of Problems with
 *     a problemId String           // Stored as _id in MongoDB
 *     a name String
 *     a grade String
 *     a holds containing a set of Strings  // hold positions on board
 *     a movementTypes containing a set of Strings  // crimp, dyno, heel hook, etc.
 *     a board Board                // Reference to the Board concept's ID
 *     a setter User                // Reference to the User concept's ID
 */
interface ProblemDocument {
  _id: Problem; // Maps to 'problemId String' in the concept state
  name: string;
  grade: string;
  holds: string[]; // Represents 'set of Strings'
  movementTypes: string[]; // Represents 'set of Strings'
  board: Board;
  setter: User;
}

export default class ProblemConcept {
  // MongoDB collection for storing Problem documents
  private problems: Collection<ProblemDocument>;

  constructor(private readonly db: Db) {
    this.problems = this.db.collection<ProblemDocument>(PREFIX + "problems");
  }

  /**
   * createProblem(name: String, grade: String, holds: set of Strings,
   *               movementTypes: set of Strings, board: Board, setter: User): (problem: Problem)
   *
   * **requires**
   *   - `name` must be a non-empty string.
   *   - `grade` must be a non-empty string.
   *   - `holds` must be a non-empty array of strings.
   *   - `board` and `setter` must be valid `ID`s (implicitly, as the concept is polymorphic).
   *
   * **effects**
   *   - Generates a unique `problemId`.
   *   - Creates and inserts a new problem document into the 'problems' collection with the given attributes.
   *   - Returns an object containing the `problemId` of the newly created problem.
   *   - If any required field is missing or invalid, returns an error object.
   */
  async createProblem(
    {
      name,
      grade,
      holds,
      movementTypes,
      board,
      setter,
    }: {
      name: string;
      grade: string;
      holds: string[];
      movementTypes?: string[]; // Made optional in the input and defaults to empty array
      board: Board;
      setter: User;
    },
  ): Promise<{ problem: Problem } | { error: string }> {
    // Validate input arguments
    if (!name || name.trim() === "") {
      return { error: "Problem name cannot be empty." };
    }
    if (!grade || grade.trim() === "") {
      return { error: "Problem grade cannot be empty." };
    }
    if (!holds || holds.length === 0) {
      return { error: "Problem must have at least one hold position." };
    }
    // For polymorphic IDs like Board and User, we primarily check for existence.
    // Their validity as actual entities (e.g., existing Board in a BoardConcept)
    // would typically be handled by higher-level syncs or other concept interactions.
    if (!board) {
      return { error: "Problem must be associated with a board ID." };
    }
    if (!setter) {
      return { error: "Problem must have a setter (User ID)." };
    }

    const newProblemId: Problem = freshID(); // Generate a unique ID for the new problem
    const newProblem: ProblemDocument = {
      _id: newProblemId,
      name,
      grade,
      holds,
      movementTypes: movementTypes || [], // Default to an empty array if not provided
      board,
      setter,
    };

    try {
      await this.problems.insertOne(newProblem);
      // Return the ID of the created problem within a dictionary, as per concept design
      return { problem: newProblemId };
    } catch (e) {
      console.error("Database error during createProblem:", e);
      // Return a generic error message for internal server errors
      return { error: "Failed to create problem due to an internal server error." };
    }
  }

  /**
   * getProblemsByBoard(board: Board): (problems: set of Problems)
   *
   * **requires**
   *   - `board` must be a valid `ID`.
   *
   * **effects**
   *   - Returns an object containing an array of all `ProblemDocument`s associated with the specified `board` ID.
   *   - If `board` is empty, returns an error object.
   *   - If no problems are found, returns an empty array.
   */
  async getProblemsByBoard(
    { board }: { board: Board },
  ): Promise<{ problems: ProblemDocument[] } | { error: string }> {
    if (!board) {
      return { error: "Board ID cannot be empty." };
    }

    try {
      // Find all problems where the 'board' field matches the provided board ID
      const foundProblems = await this.problems.find({ board }).toArray();
      // Return the array of found ProblemDocuments within a dictionary
      return { problems: foundProblems };
    } catch (e) {
      console.error("Database error during getProblemsByBoard:", e);
      return { error: "Failed to retrieve problems by board due to an internal server error." };
    }
  }

  /**
   * getProblemsByGrade(grade: String): (problems: set of Problems)
   *
   * **requires**
   *   - `grade` must be a non-empty string.
   *
   * **effects**
   *   - Returns an object containing an array of all `ProblemDocument`s matching the specified `grade`.
   *   - If `grade` is empty, returns an error object.
   *   - If no problems are found, returns an empty array.
   */
  async getProblemsByGrade(
    { grade }: { grade: string },
  ): Promise<{ problems: ProblemDocument[] } | { error: string }> {
    if (!grade || grade.trim() === "") {
      return { error: "Grade cannot be empty." };
    }

    try {
      // Find all problems where the 'grade' field matches the provided grade string
      const foundProblems = await this.problems.find({ grade }).toArray();
      // Return the array of found ProblemDocuments within a dictionary
      return { problems: foundProblems };
    } catch (e) {
      console.error("Database error during getProblemsByGrade:", e);
      return { error: "Failed to retrieve problems by grade due to an internal server error." };
    }
  }
}
```
