import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types";
import { freshID } from "@utils/database";

// Collection prefix to ensure namespace separation
const PREFIX = "LikertSurvey" + ".";

// Generic types for the concept's external dependencies
type Author = ID;
type Respondent = ID;

// Internal entity types, represented as IDs
type Survey = ID;
type Question = ID;
type Response = ID;

/**
 * State: A set of Surveys with an author, title, and scale.
 */
interface SurveyDoc {
  _id: Survey;
  author: Author;
  title: string;
  scaleMin: number;
  scaleMax: number;
}

/**
 * State: A set of Questions, each linked to a survey and containing text.
 */
interface QuestionDoc {
  _id: Question;
  survey: Survey;
  text: string;
}

/**
 * State: A set of Responses, linking a respondent, a question, and their chosen value.
 */
interface ResponseDoc {
  _id: Response;
  respondent: Respondent;
  question: Question;
  value: number;
}

/**
 * @concept LikertSurvey
 * @purpose To measure attitudes or opinions by asking respondents to rate their level of agreement with a series of statements on a predefined scale.
 */
export default class LikertSurveyConcept {
  surveys: Collection<SurveyDoc>;
  questions: Collection<QuestionDoc>;
  responses: Collection<ResponseDoc>;

  constructor(private readonly db: Db) {
    this.surveys = this.db.collection(PREFIX + "surveys");
    this.questions = this.db.collection(PREFIX + "questions");
    this.responses = this.db.collection(PREFIX + "responses");
  }

  /**
   * Action: Creates a new survey.
   * @requires scaleMin must be less than scaleMax.
   * @effects A new survey is created and its ID is returned.
   */
  async createSurvey(
    { author, title, scaleMin, scaleMax }: {
      author: Author;
      title: string;
      scaleMin: number;
      scaleMax: number;
    },
  ): Promise<{ survey: Survey } | { error: string }> {
    if (scaleMin >= scaleMax) {
      return { error: "scaleMin must be less than scaleMax" };
    }

    const surveyId = freshID() as Survey;
    await this.surveys.insertOne({
      _id: surveyId,
      author,
      title,
      scaleMin,
      scaleMax,
    });
    return { survey: surveyId };
  }

  /**
   * Action: Adds a new question to an existing survey.
   * @requires The survey must exist.
   * @effects A new question is created and its ID is returned.
   */
  async addQuestion(
    { survey, text }: { survey: Survey; text: string },
  ): Promise<{ question: Question } | { error: string }> {
    const existingSurvey = await this.surveys.findOne({ _id: survey });
    if (!existingSurvey) {
      return { error: `Survey with ID ${survey} not found.` };
    }

    const questionId = freshID() as Question;
    await this.questions.insertOne({ _id: questionId, survey, text });
    return { question: questionId };
  }

  /**
   * Action: Submits a response to a question.
   * @requires The question must exist.
   * @requires The respondent must not have already responded to this question.
   * @requires The response value must be within the survey's defined scale.
   * @effects A new response is recorded in the state.
   */
  async submitResponse(
    { respondent, question, value }: {
      respondent: Respondent;
      question: Question;
      value: number;
    },
  ): Promise<Empty | { error: string }> {
    const questionDoc = await this.questions.findOne({ _id: question });
    if (!questionDoc) {
      return { error: `Question with ID ${question} not found.` };
    }

    const surveyDoc = await this.surveys.findOne({ _id: questionDoc.survey });
    if (!surveyDoc) {
      // This indicates a data integrity issue but is a good safeguard.
      return { error: "Associated survey for the question not found." };
    }

    if (value < surveyDoc.scaleMin || value > surveyDoc.scaleMax) {
      return {
        error:
          `Response value ${value} is outside the survey's scale [${surveyDoc.scaleMin}, ${surveyDoc.scaleMax}].`,
      };
    }

    const existingResponse = await this.responses.findOne({
      respondent,
      question,
    });
    if (existingResponse) {
      return {
        error:
          "Respondent has already answered this question. Use updateResponse to change it.",
      };
    }

    const responseId = freshID() as Response;
    await this.responses.insertOne({
      _id: responseId,
      respondent,
      question,
      value,
    });

    return {};
  }

  /**
   * Action: Updates an existing response to a question.
   * @requires The question must exist.
   * @requires A response from the given respondent to the question must already exist.
   * @requires The new response value must be within the survey's defined scale.
   * @effects The existing response's value is updated.
   */
  async updateResponse(
    { respondent, question, value }: {
      respondent: Respondent;
      question: Question;
      value: number;
    },
  ): Promise<Empty | { error: string }> {
    const questionDoc = await this.questions.findOne({ _id: question });
    if (!questionDoc) {
      return { error: `Question with ID ${question} not found.` };
    }

    const surveyDoc = await this.surveys.findOne({ _id: questionDoc.survey });
    if (!surveyDoc) {
      return { error: "Associated survey for the question not found." };
    }

    if (value < surveyDoc.scaleMin || value > surveyDoc.scaleMax) {
      return {
        error:
          `Response value ${value} is outside the survey's scale [${surveyDoc.scaleMin}, ${surveyDoc.scaleMax}].`,
      };
    }

    const result = await this.responses.updateOne({ respondent, question }, {
      $set: { value },
    });

    if (result.matchedCount === 0) {
      return {
        error:
          "No existing response found to update. Use submitResponse to create one.",
      };
    }

    return {};
  }

  /**
   * Query: Retrieves all questions associated with a specific survey.
   */
  async _getSurveyQuestions(
    { survey }: { survey: Survey },
  ): Promise<QuestionDoc[]> {
    return await this.questions.find({ survey }).toArray();
  }

  /**
   * Query: Retrieves all responses for a given survey. This involves finding all
   * questions for the survey first, then finding all responses to those questions.
   */
  async _getSurveyResponses(
    { survey }: { survey: Survey },
  ): Promise<ResponseDoc[]> {
    const surveyQuestions = await this.questions.find({ survey }).project({
      _id: 1,
    }).toArray();
    const questionIds = surveyQuestions.map((q) => q._id as Question);
    return await this.responses.find({ question: { $in: questionIds } })
      .toArray();
  }

  /**
   * Query: Retrieves all answers submitted by a specific respondent.
   */
  async _getRespondentAnswers(
    { respondent }: { respondent: Respondent },
  ): Promise<ResponseDoc[]> {
    return await this.responses.find({ respondent }).toArray();
  }
}
