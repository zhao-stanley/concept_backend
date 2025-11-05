/**
 * Passthrough route configuration
 * 
 * Inclusions: routes that are directly accessible via POST requests
 * Exclusions: routes that require syncs to handle
 */

export const inclusions: Record<string, string> = {
  // Problem Concept - Public read operations
  "/api/Problem/searchProblems": "Public query - allows users to search for climbing problems by various filters",
  "/api/Problem/getProblemsByGrade": "Public query - allows users to browse problems by grade",
  "/api/Problem/createProblem": "Public action - allows users to create new climbing problems",
  
  // Video Concept - Public operations
  "/api/Video/importVideo": "Public action - allows importing videos from external sources",
  "/api/Video/getVideo": "Public action - retrieves a video by ID",
  "/api/Video/removeVideo": "Public action - removes a video from the system",
  "/api/Video/_getVideoDetails": "Public query - retrieves full video details including source and URL",
  
  // Tagging Concept - Public operations
  "/api/Tagging/tag": "Public action - allows tagging items with descriptive labels",
  "/api/Tagging/_getItemsByTag": "Public query - retrieves all items with a specific tag",
  "/api/Tagging/_getTags": "Public query - retrieves all tags associated with an item",
  "/api/Tagging/removeTag": "Public action - removes a specific tag from an item",
  "/api/Tagging/removeAllTags": "Public action - removes all tags from an item",
};

export const exclusions: Array<string> = [];
