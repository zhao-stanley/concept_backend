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
 *     a holds containing a set of Strings  // hold positions on board (e.g., "5,3")
 *     a feet containing a set of Strings   // foot hold positions (e.g., "9,1")
 *     a boardType String           // Board type ("12x12" or "10x12")
 *     a angle Number               // Board angle in degrees (0-70)
 *     a setterName String          // Name of the setter for search purposes
 */
interface ProblemDocument {
  _id: Problem; // Maps to 'problemId String' in the concept state
  name: string;
  grade: string;
  holds: string[]; // Represents 'set of Strings' - coordinates like "5,3"
  feet: string[];  // Represents 'set of Strings' - coordinates like "9,1"
  boardType: string;
  angle: number;   // Board angle in degrees (0-70)
  setterName: string;
}

export default class ProblemConcept {
  // MongoDB collection for storing Problem documents
  private problems: Collection<ProblemDocument>;

  constructor(private readonly db: Db) {
    this.problems = this.db.collection<ProblemDocument>(PREFIX + "problems");
  }

  /**
   * createProblem(name: String, grade: String, holds: set of Strings, feet: set of Strings,
   *               boardType: String, angle: Number, setterName: String): (problem: Problem)
   *
   * **requires**
   *   - `name` must be a non-empty string.
   *   - `grade` must be a non-empty string.
   *   - `holds` must be a non-empty array of strings (coordinates like "5,3").
   *   - `feet` must be an array of strings (coordinates like "9,1"), can be empty.
   *   - `boardType` must be either "12x12" or "10x12".
   *   - `angle` must be a number between 0 and 70 (inclusive).
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
      feet,
      boardType,
      angle,
      setterName,
    }: {
      name: string;
      grade: string;
      holds: string[];
      feet: string[];
      boardType: string;
      angle: number;
      setterName: string;
    },
  ): Promise<{ problem: Problem } | { error: string }> {
    console.log(`Action: createProblem with name: '${name}', boardType: '${boardType}', angle: ${angle}, setterName: '${setterName}'`);

    // --- Requires validation ---
    if (!name || name.trim() === "") {
      console.log("Validation Error: Problem name cannot be empty.");
      return { error: "Problem name cannot be empty." };
    }
    if (!grade || grade.trim() === "") {
      console.log("Validation Error: Problem grade cannot be empty.");
      return { error: "Problem grade cannot be empty." };
    }
    if (!holds || holds.length === 0) {
      console.log("Validation Error: Problem must have at least one hold position.");
      return { error: "Problem must have at least one hold position." };
    }
    if (!boardType || boardType.trim() === "") {
      console.log("Validation Error: Problem must have a board type.");
      return { error: "Problem must have a board type." };
    }
    if (boardType !== "12x12" && boardType !== "10x12") {
      console.log("Validation Error: Board type must be either '12x12' or '10x12'.");
      return { error: "Board type must be either '12x12' or '10x12'." };
    }
    if (angle === undefined || angle === null) {
      console.log("Validation Error: Problem must have an angle.");
      return { error: "Problem must have an angle." };
    }
    if (!Number.isInteger(angle)) {
      console.log("Validation Error: Angle must be an integer.");
      return { error: "Angle must be an integer." };
    }
    if (angle < 0 || angle > 70) {
      console.log("Validation Error: Angle must be between 0 and 70 degrees.");
      return { error: "Angle must be between 0 and 70 degrees." };
    }
    if (!setterName || setterName.trim() === "") {
      console.log("Validation Error: Problem must have a setter name.");
      return { error: "Problem must have a setter name." };
    }

    const newProblemId: Problem = freshID(); // Generate a unique ID for the new problem
    const newProblem: ProblemDocument = {
      _id: newProblemId,
      name,
      grade,
      holds,
      feet,
      boardType,
      angle,
      setterName,
    };

    try {
      await this.problems.insertOne(newProblem);
      console.log(`Effect: Created problem with ID: '${newProblemId}'`);
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
    console.log(`Action: getProblemsByGrade for grade: '${grade}'`);

    // --- Requires validation ---
    if (!grade || grade.trim() === "") {
      console.log("Validation Error: Grade cannot be empty for getProblemsByGrade.");
      return { error: "Grade cannot be empty." };
    }

    try {
      // Find all problems where the 'grade' field matches the provided grade string
      const foundProblems = await this.problems.find({ grade }).toArray();
      console.log(`Effect: Found ${foundProblems.length} problems for grade: '${grade}'`);
      // Return the array of found ProblemDocuments within a dictionary, as actions return dictionaries
      return { problems: foundProblems };
    } catch (e) {
      console.error("Database error during getProblemsByGrade:", e);
      return { error: "Failed to retrieve problems by grade due to an internal server error." };
    }
  }

  /**
   * searchProblems(gradeMin?: String, gradeMax?: String, boardType?: String, angle?: Number, setterName?: String, holds?: set of Strings): (problems: set of Problems)
   *
   * **requires**
   *   - At least one search parameter must be provided.
   *   - If `gradeMin` or `gradeMax` are provided, they must follow the format "vN" where N is 0-17.
   *   - If `angle` is provided, it must be between 0 and 70.
   *   - If `holds` are provided, they must be an array of hold coordinates.
   *
   * **effects**
   *   - Returns an object containing an array of all `ProblemDocument`s matching the search criteria.
   *   - Filters by grade range if `gradeMin` and/or `gradeMax` are provided (inclusive).
   *   - Filters by `boardType` if provided (exact match).
   *   - Filters by `angle` if provided (exact match).
   *   - Filters by `setterName` if provided (case-insensitive partial match).
   *   - Filters by `holds` if provided (problems must contain all specified holds).
   *   - If no search parameters are provided, returns an error object.
   *   - If no problems match the criteria, returns an empty array.
   */
  async searchProblems(
    {
      gradeMin,
      gradeMax,
      boardType,
      angle,
      setterName,
      holds,
    }: {
      gradeMin?: string;
      gradeMax?: string;
      boardType?: string;
      angle?: number;
      setterName?: string;
      holds?: string[];
    },
  ): Promise<{ problems: ProblemDocument[] } | { error: string }> {
    console.log(
      `Action: searchProblems with gradeMin: '${gradeMin}', gradeMax: '${gradeMax}', boardType: '${boardType}', angle: ${angle}, setterName: '${setterName}', holds: '${holds?.join(",")}'`,
    );

    // --- Requires validation ---
    if (!gradeMin && !gradeMax && !boardType && angle === undefined && !setterName && (!holds || holds.length === 0)) {
      console.log("Validation Error: At least one search parameter must be provided.");
      return { error: "At least one search parameter must be provided." };
    }

    try {
      // Build the query filter
      const filter: Record<string, unknown> = {};

      // Handle grade range filtering
      if (gradeMin || gradeMax) {
        // Extract numeric values from grade strings (e.g., "v5" -> 5)
        const extractGradeNumber = (grade: string): number | null => {
          const match = grade.match(/^v(\d+)$/i);
          return match ? parseInt(match[1], 10) : null;
        };

        const minNum = gradeMin ? extractGradeNumber(gradeMin) : null;
        const maxNum = gradeMax ? extractGradeNumber(gradeMax) : null;

        if ((gradeMin && minNum === null) || (gradeMax && maxNum === null)) {
          console.log("Validation Error: Grade must be in format 'vN' where N is 0-17.");
          return { error: "Grade must be in format 'vN' where N is 0-17." };
        }

        // Build regex pattern for grade range
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
          console.log("Validation Error: Board type must be either '12x12' or '10x12'.");
          return { error: "Board type must be either '12x12' or '10x12'." };
        }
        filter.boardType = boardType;
      }

      // Handle angle filtering
      if (angle !== undefined) {
        if (!Number.isInteger(angle)) {
          console.log("Validation Error: Angle must be an integer.");
          return { error: "Angle must be an integer." };
        }
        if (angle < 0 || angle > 70) {
          console.log("Validation Error: Angle must be between 0 and 70 degrees.");
          return { error: "Angle must be between 0 and 70 degrees." };
        }
        filter.angle = angle;
      }

      // Handle setter name filtering (case-insensitive partial match)
      if (setterName) {
        filter.setterName = { $regex: setterName, $options: "i" };
      }

      // Handle holds filtering (problems must contain all specified holds)
      if (holds && holds.length > 0) {
        filter.holds = { $all: holds };
      }

      const foundProblems = await this.problems.find(filter).toArray();
      console.log(`Effect: Found ${foundProblems.length} problems matching search criteria`);
      return { problems: foundProblems };
    } catch (e) {
      console.error("Database error during searchProblems:", e);
      return { error: "Failed to search problems due to an internal server error." };
    }
  }
}