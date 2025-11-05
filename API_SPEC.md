# API Specification

**Base URL:** `http://localhost:8000/api`

All endpoints accept POST requests with JSON bodies.

---

# Problem Concept

**Purpose:** Represent climbing routes on training boards with holds, difficulty, and board configuration

---

## POST /api/Problem/createProblem

**Description:** Creates a new climbing problem with specified holds, feet positions, grade, and board configuration.

**Requirements:**
- `name` must be a non-empty string
- `grade` must be a non-empty string
- `holds` must be a non-empty array of coordinate strings
- `feet` must be an array of coordinate strings (can be empty)
- `boardType` must be either "12x12" or "10x12"
- `angle` must be an integer between 0 and 70 (inclusive)
- `setterName` must be a non-empty string

**Effects:**
- Generates a unique `problemId`
- Creates and inserts a new problem document with the given attributes
- Returns the `problemId` of the newly created problem

**Request Body:**
```json
{
  "name": "String",
  "grade": "String",
  "holds": ["String"],
  "feet": ["String"],
  "boardType": "String",
  "angle": Number,
  "setterName": "String"
}
```

**Example Request:**
```json
{
  "name": "Crimp City",
  "grade": "V5",
  "holds": ["5,3", "7,5", "3,7", "8,9"],
  "feet": ["9,1", "12,2"],
  "boardType": "12x12",
  "angle": 45,
  "setterName": "Alex Honnold"
}
```

**Success Response:**
```json
{
  "problem": "String"
}
```

**Error Response:**
```json
{
  "error": "string"
}
```

---

## POST /api/Problem/getProblemsByGrade

**Description:** Retrieves all climbing problems matching a specific grade.

**Requirements:**
- `grade` must be a non-empty string

**Effects:**
- Returns an array of all problem documents matching the specified grade

**Request Body:**
```json
{
  "grade": "String"
}
```

**Example Request:**
```json
{
  "grade": "V5"
}
```

**Success Response:**
```json
{
  "problems": [
    {
      "_id": "String",
      "name": "String",
      "grade": "String",
      "holds": ["String"],
      "feet": ["String"],
      "boardType": "String",
      "angle": Number,
      "setterName": "String"
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "string"
}
```

---

## POST /api/Problem/searchProblems

**Description:** Searches for climbing problems using multiple optional filters. Returns problems that match ALL provided criteria.

**Requirements:**
- At least one search parameter must be provided
- If `gradeMin` or `gradeMax` are provided, they must follow the format "vN" where N is 0-17
- If `angle` is provided, it must be an integer between 0 and 70
- If `boardType` is provided, it must be either "12x12" or "10x12"
- If `holds` are provided, they must be an array of hold coordinate strings
- If `feet` are provided, they must be an array of foot hold coordinate strings

**Effects:**
- Returns all problems that satisfy ALL provided filters (AND logic)
- **Grade filtering:** Returns problems with grades between `gradeMin` and `gradeMax` (inclusive)
- **Board type filtering:** Returns problems with exact board type match
- **Angle filtering:** Returns problems with exact angle match
- **Setter name filtering:** Returns problems where setter name contains the search string (case-insensitive)
- **Holds filtering:** Returns problems that contain ALL specified holds (must have every hold in the list)
- **Feet filtering:** Returns problems that contain ALL specified foot holds (must have every foot hold in the list)

**Request Body:**
```json
{
  "gradeMin": "String (optional)",
  "gradeMax": "String (optional)",
  "boardType": "String (optional)",
  "angle": Number (optional),
  "setterName": "String (optional)",
  "holds": ["String"] (optional),
  "feet": ["String"] (optional)
}
```

**Example Request 1 (by grade range and board type):**
```json
{
  "gradeMin": "v4",
  "gradeMax": "v6",
  "boardType": "12x12",
  "angle": 45
}
```

**Example Request 2 (search by specific holds):**
```json
{
  "holds": ["5,3", "7,5", "8,9"],
  "boardType": "12x12"
}
```
*Returns all 12x12 problems that contain holds at positions 5,3 AND 7,5 AND 8,9*

**Example Request 3 (search by holds and feet):**
```json
{
  "holds": ["5,3", "7,5"],
  "feet": ["9,1", "12,2"],
  "boardType": "12x12"
}
```
*Returns all 12x12 problems that contain both holds (5,3 AND 7,5) AND both foot holds (9,1 AND 12,2)*

**Example Request 4 (combined filters):**
```json
{
  "gradeMin": "v5",
  "gradeMax": "v7",
  "boardType": "10x12",
  "angle": 40,
  "setterName": "Alex",
  "holds": ["3,4", "6,7"],
  "feet": ["8,2"]
}
```
*Returns all problems that match ALL criteria: grade v5-v7, 10x12 board, 40° angle, setter name contains "Alex", contains holds 3,4 and 6,7, AND contains foot hold 8,2*

**Success Response:**
```json
{
  "problems": [
    {
      "_id": "String",
      "name": "String",
      "grade": "String",
      "holds": ["String"],
      "feet": ["String"],
      "boardType": "String",
      "angle": Number,
      "setterName": "String"
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "string"
}
```

---

# Video Concept

**Purpose:** Store and retrieve video content from external sources

---

## POST /api/Video/importVideo

**Description:** Imports a video from an external source using its type and URL.

**Requirements:**
- A video with the given `sourceType` and `url` must not already exist

**Effects:**
- Generates a unique `videoId`
- Creates a new video entry with the provided `sourceType` and `url`
- Returns the ID of the newly created video

**Request Body:**
```json
{
  "sourceType": "String",
  "url": "String"
}
```

**Example Request:**
```json
{
  "sourceType": "youtube",
  "url": "https://youtube.com/watch?v=..."
}
```

**Success Response:**
```json
{
  "video": "String"
}
```

**Error Response:**
```json
{
  "error": "string"
}
```

---

## POST /api/Video/getVideo

**Description:** Retrieves the identifier of a video by its unique ID.

**Requirements:**
- The video with the specified `videoId` must exist

**Effects:**
- Returns the ID of the video corresponding to the `videoId`

**Request Body:**
```json
{
  "videoId": "String"
}
```

**Success Response:**
```json
{
  "video": "String"
}
```

**Error Response:**
```json
{
  "error": "string"
}
```

---

## POST /api/Video/removeVideo

**Description:** Removes a video identified by its unique ID from the system.

**Requirements:**
- The video with the specified `videoId` must exist

**Effects:**
- Removes the video from the Videos collection

**Request Body:**
```json
{
  "videoId": "String"
}
```

**Success Response:**
```json
{}
```

**Error Response:**
```json
{
  "error": "string"
}
```

---

## POST /api/Video/_getVideoDetails

**Description:** Retrieves full details of a video including sourceType and URL.

**Requirements:**
- The video with the specified `videoId` must exist

**Effects:**
- Returns the complete video document with all fields

**Request Body:**
```json
{
  "videoId": "String"
}
```

**Success Response:**
```json
{
  "_id": "String",
  "sourceType": "String",
  "url": "String"
}
```

**Error Response:**
```json
{
  "error": "string"
}
```

---

# Tagging Concept

**Purpose:** Associate items with descriptive labels for organization and discovery

**Note:** The Tagging concept is used to link videos to problems. Use it to attach demonstration videos to climbing problems.

---

## POST /api/Tagging/tag

**Description:** Associates an item (e.g., problem) with labels (e.g., video IDs).

**Requirements:**
- `item` must be a valid ID
- `labels` must be an array of strings (can be empty)

**Effects:**
- Adds or updates tags for the specified item
- Creates the item entry if it doesn't exist
- New labels are added to existing labels (set union)

**Request Body:**
```json
{
  "item": "String",
  "labels": ["String"]
}
```

**Example Request (linking videos to a problem):**
```json
{
  "item": "problem-id-123",
  "labels": ["video-id-456", "video-id-789"]
}
```

**Success Response:**
```json
{}
```

**Error Response:**
```json
{
  "error": "string"
}
```

---

## POST /api/Tagging/_getItemsByTag

**Description:** Retrieves all items that have been tagged with a specific label.

**Requirements:**
- `label` must be a non-empty string

**Effects:**
- Returns all items (e.g., problems) associated with the specified label (e.g., video ID)

**Request Body:**
```json
{
  "label": "String"
}
```

**Example Request (find all problems with a specific video):**
```json
{
  "label": "video-id-456"
}
```

**Success Response:**
```json
[
  {
    "item": "String"
  }
]
```

**Error Response:**
```json
[
  {
    "error": "string"
  }
]
```

---

## POST /api/Tagging/_getTags

**Description:** Retrieves all tags (e.g., video IDs) associated with a specific item (e.g., problem).

**Requirements:**
- `item` must be a valid ID

**Effects:**
- Returns all tags associated with the specified item

**Request Body:**
```json
{
  "item": "String"
}
```

**Example Request (get all videos for a problem):**
```json
{
  "item": "problem-id-123"
}
```

**Success Response:**
```json
[
  {
    "tag": "String"
  }
]
```

**Error Response:**
```json
[
  {
    "error": "string"
  }
]
```

---

## POST /api/Tagging/removeTag

**Description:** Removes a specific label from an item.

**Requirements:**
- `item` must exist in the Tags collection
- `label` must be a non-empty string

**Effects:**
- Removes the specified label from the item's tag set

**Request Body:**
```json
{
  "item": "String",
  "label": "String"
}
```

**Success Response:**
```json
{}
```

**Error Response:**
```json
{
  "error": "string"
}
```

---

## POST /api/Tagging/removeAllTags

**Description:** Removes all tags associated with a specific item.

**Requirements:**
- `item` must exist in the Tags collection

**Effects:**
- Removes the item entry from the Tags collection

**Request Body:**
```json
{
  "item": "String"
}
```

**Success Response:**
```json
{}
```

**Error Response:**
```json
{
  "error": "string"
}
```

---

# Usage Example: Linking Videos to Problems

**1. Create a problem:**
```bash
POST /api/Problem/createProblem
{
  "name": "Crimp City",
  "grade": "V5",
  "holds": ["5,3", "7,5"],
  "feet": ["9,1"],
  "boardType": "12x12",
  "angle": 45,
  "setterName": "Alex Honnold"
}
# Returns: { "problem": "problem-id-123" }
```

**2. Import a video:**
```bash
POST /api/Video/importVideo
{
  "sourceType": "youtube",
  "url": "https://youtube.com/watch?v=..."
}
# Returns: { "video": "video-id-456" }
```

**3. Link the video to the problem:**
```bash
POST /api/Tagging/tag
{
  "item": "problem-id-123",
  "labels": ["video-id-456"]
}
```

**4. Get all videos for a problem:**
```bash
POST /api/Tagging/_getTags
{
  "item": "problem-id-123"
}
# Returns: [{ "tag": "video-id-456" }]
```

