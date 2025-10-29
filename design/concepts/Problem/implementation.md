[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

# implement: Problem

# concept: Problem

```
concept Problem

purpose
    represent climbing routes on training boards with holds, difficulty

principle
    after creating a problem with specific holds and attributes,
    users can discover and attempt the problem based on its characteristics

state
    a set of Problems with
        a problemId String
        a name String
        a grade String
        a holds containing a set of Strings  // hold positions on board etc.
        a boardType String  // "12x12" or "10x12"
        a setterName String  // name of the setter

actions
    createProblem(name: String, grade: String, holds: set of Strings,
                  boardType: String, setterName: String): (problem: Problem)
        effect:
            generate unique problemId
            create new problem with given attributes
            return the created problem

    getProblemsByGrade(grade: String): (problems: set of Problems)
        effect:
            return all problems matching the specified grade

    searchProblems(gradeMin?: String, gradeMax?: String, 
                   boardType?: String, setterName?: String): (problems: set of Problems)
        effect:
            return all problems matching the search criteria
            filters by grade range (v0-v17), board type, and setter name
```

# response:

```typescript
// file: src/concepts/Problem/ProblemConcept.ts

import { Collection, Db } from "npm:mongodb";
import { ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, use concept name
const PREFIX = "Problem" + ".";

// Generic types of this concept, treated polymorphically (as IDs)
type Problem = ID; // The unique identifier for a Problem instance

/**
 * concept Problem
 *
 * purpose: represent climbing routes on training boards with holds, difficulty, and movement patterns
 *
 * principle: after creating a problem with specific holds and attributes,
 * users can discover and attempt the problem based on its characteristics
 */

/**
 * state:
 * a set of Problems with
 *     a problemId String           // Stored as _id in MongoDB
 *     a name String
 *     a grade String
 *     a holds containing a set of Strings  // hold positions on board
 *     a boardType String           // Board type ("12x12" or "10x12")
 *     a setterName String          // Name of the setter for search purposes
 */
interface ProblemDocument {
  _id: Problem; // Maps to 'problemId String' in the concept state
  name: string;
  grade: string;
  holds: string[]; // Represents 'set of Strings'
  boardType: string;
  setterName: string;
}

export default class ProblemConcept {
  // MongoDB collection for storing Problem documents
  private problems: Collection<ProblemDocument>;

  constructor(private readonly db: Db) {
    this.problems = this.db.collection<ProblemDocument>(PREFIX + "problems");
  }

  /**
   * createProblem(name: String, grade: String, holds: set of Strings,
   *               boardType: String, setterName: String): (problem: Problem)
   *
   * **requires**
   *   - `name` must be a non-empty string.
   *   - `grade` must be a non-empty string.
   *   - `holds` must be a non-empty array of strings.
   *   - `boardType` must be either "12x12" or "10x12".
   *   - `setterName` must be a non-empty string.
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
      boardType,
      setterName,
    }: {
      name: string;
      grade: string;
      holds: string[];
      boardType: string;
      setterName: string;
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
    if (!boardType || boardType.trim() === "") {
      return { error: "Problem must have a board type." };
    }
    if (boardType !== "12x12" && boardType !== "10x12") {
      return { error: "Board type must be either '12x12' or '10x12'." };
    }
    if (!setterName || setterName.trim() === "") {
      return { error: "Problem must have a setter name." };
    }

    const newProblemId: Problem = freshID(); // Generate a unique ID for the new problem
    const newProblem: ProblemDocument = {
      _id: newProblemId,
      name,
      grade,
      holds,
      boardType,
      setterName,
    };

    try {
      await this.problems.insertOne(newProblem);
      // Return the ID of the created problem as specified
      return { problem: newProblemId };
    } catch (e) {
      console.error("Database error during createProblem:", e);
      return { error: "Failed to create problem due to an internal server error." };
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
      // Return the array of found ProblemDocuments within a dictionary, as actions return dictionaries
      return { problems: foundProblems };
    } catch (e) {
      console.error("Database error during getProblemsByGrade:", e);
      return { error: "Failed to retrieve problems by grade due to an internal server error." };
    }
  }

  /**
   * searchProblems(gradeMin?: String, gradeMax?: String, boardType?: String, setterName?: String): (problems: set of Problems)
   *
   * **requires**
   *   - At least one search parameter must be provided.
   *   - If `gradeMin` or `gradeMax` are provided, they must follow the format "vN" where N is 0-17.
   *
   * **effects**
   *   - Returns an object containing an array of all `ProblemDocument`s matching the search criteria.
   *   - Filters by grade range if `gradeMin` and/or `gradeMax` are provided (inclusive).
   *   - Filters by `boardType` if provided (exact match, must be "12x12" or "10x12").
   *   - Filters by `setterName` if provided (case-insensitive partial match).
   *   - If no search parameters are provided, returns an error object.
   *   - If no problems match the criteria, returns an empty array.
   */
  async searchProblems(
    {
      gradeMin,
      gradeMax,
      boardType,
      setterName,
    }: {
      gradeMin?: string;
      gradeMax?: string;
      boardType?: string;
      setterName?: string;
    },
  ): Promise<{ problems: ProblemDocument[] } | { error: string }> {
    // Validate at least one parameter is provided
    if (!gradeMin && !gradeMax && !boardType && !setterName) {
      return { error: "At least one search parameter must be provided." };
    }

    try {
      const filter: Record<string, unknown> = {};

      // Handle grade range filtering
      if (gradeMin || gradeMax) {
        const extractGradeNumber = (grade: string): number | null => {
          const match = grade.match(/^v(\d+)$/i);
          return match ? parseInt(match[1], 10) : null;
        };

        const minNum = gradeMin ? extractGradeNumber(gradeMin) : null;
        const maxNum = gradeMax ? extractGradeNumber(gradeMax) : null;

        if ((gradeMin && minNum === null) || (gradeMax && maxNum === null)) {
          return { error: "Grade must be in format 'vN' where N is 0-17." };
        }

        const validGrades: string[] = [];
        for (let i = 0; i <= 17; i++) {
          if (
            (minNum === null || i >= minNum) &&
            (maxNum === null || i <= maxNum)
          ) {
            validGrades.push(`v${i}`);
          }
        }

        if (validGrades.length > 0) {
          filter.grade = { $in: validGrades };
        }
      }

      // Handle board type filtering
      if (boardType) {
        if (boardType !== "12x12" && boardType !== "10x12") {
          return { error: "Board type must be either '12x12' or '10x12'." };
        }
        filter.boardType = boardType;
      }

      // Handle setter name filtering (case-insensitive partial match)
      if (setterName) {
        filter.setterName = { $regex: setterName, $options: "i" };
      }

      const foundProblems = await this.problems.find(filter).toArray();
      return { problems: foundProblems };
    } catch (e) {
      console.error("Database error during searchProblems:", e);
      return { error: "Failed to search problems due to an internal server error." };
    }
  }
}
```