[@concept-design-overview](../../background/concept-design-overview.md)

[@concept-specifications](../../background/concept-specifications.md)

[@implementing-concepts](../../background/implementing-concepts.md)

# implement: Video

# concept: Video
concept Video

purpose
    store and retrieve video content from external sources

principle
    after importing a video from an external source with its URL,
    users can retrieve and view the video content

state
    a set of Videos with
        a videoId String
        a sourceType String  // "youtube", "instagram", "vimeo", etc.
        a url String

actions
    importVideo(sourceType: String, url: String): (video: Video)
        effect:
            generate unique videoId
            create new video with given sourceType, and url
            return the created video

    getVideo(videoId: String): (video: Video)
        effect:
            return the video with the specified videoId

    removeVideo(videoId: String)
        requires:
            video with videoId exists
        effect:
            remove video from Videos
# response:

```typescript
import { Collection, Db } from "npm:mongodb";
import { Empty, ID } from "@utils/types.ts";
import { freshID } from "@utils/database.ts";

// Declare collection prefix, using the concept name
const PREFIX = "Video" + ".";

/**
 * Generic type for a Video entity.
 * In this concept, 'Video' refers to the unique identifier of a video.
 */
type Video = ID;

/**
 * Interface representing the structure of a video document in the database.
 * This corresponds to "a set of Videos with a videoId String, a sourceType String, a url String"
 * from the concept's state declaration.
 * The `_id` field in MongoDB is used to store the concept's `videoId`.
 */
interface VideosDoc {
  _id: Video; // Stores the unique videoId
  sourceType: string;
  url: string;
}

/**
 * concept Video
 *
 * purpose store and retrieve video content from external sources
 *
 * principle after importing a video from an external source with its URL,
 *           users can retrieve and view the video content
 */
export default class VideoConcept {
  // MongoDB collection to store video documents
  videos: Collection<VideosDoc>;

  constructor(private readonly db: Db) {
    this.videos = this.db.collection(PREFIX + "videos");
  }

  /**
   * importVideo(sourceType: String, url: String): (video: Video)
   *
   * **requires** A video with the given `sourceType` and `url` does not already exist.
   *
   * **effects** Generates a unique `videoId`. Creates a new video entry with the provided
   *             `sourceType` and `url`. Returns the `ID` of the newly created video.
   */
  async importVideo(
    { sourceType, url }: { sourceType: string; url: string },
  ): Promise<{ video: Video } | { error: string }> {
    // Check if a video with the same sourceType and URL already exists to prevent duplicates.
    // While the spec doesn't explicitly state this as a "requires" condition, it's a common
    // and robust design choice to prevent logical duplicates.
    const existingVideo = await this.videos.findOne({ sourceType, url });
    if (existingVideo) {
      return {
        error:
          `A video from '${sourceType}' with URL '${url}' already exists (ID: ${existingVideo._id}).`,
      };
    }

    const newVideoId = freshID(); // Generate a fresh unique ID for the new video
    const newVideo: VideosDoc = {
      _id: newVideoId,
      sourceType,
      url,
    };

    try {
      await this.videos.insertOne(newVideo);
      return { video: newVideoId };
    } catch (e) {
      console.error("Error importing video:", e);
      return { error: "Failed to import video due to a database error." };
    }
  }

  /**
   * getVideo(videoId: String): (video: Video)
   *
   * **requires** The video with the specified `videoId` exists.
   *
   * **effects** Returns the `ID` of the video corresponding to the `videoId`.
   *
   * Note: As per the conventional interpretation of action return signatures like
   * `(user: User)` for IDs, this action returns the *ID* of the video. To retrieve
   * the full video details (e.g., `sourceType`, `url`) for "viewing the content" as
   * suggested by the principle, a dedicated query method (e.g., `_getVideoDetails`)
   * returning a richer object structure would typically be defined.
   */
  async getVideo(
    { videoId }: { videoId: string },
  ): Promise<{ video: Video } | { error: string }> {
    // Find the video document by its ID
    const video = await this.videos.findOne({ _id: videoId as ID });

    if (!video) {
      return { error: `Video with ID '${videoId}' not found.` };
    }
    // Return the ID of the found video
    return { video: video._id };
  }

  /**
   * removeVideo(videoId: String): Empty | { error: string }
   *
   * **requires** A video with the given `videoId` exists.
   *
   * **effects** Removes the video entry from the collection corresponding to the `videoId`.
   */
  async removeVideo(
    { videoId }: { videoId: string },
  ): Promise<Empty | { error: string }> {
    // Check if the video exists before attempting to delete it, fulfilling the 'requires' condition.
    const videoExists = await this.videos.findOne({ _id: videoId as ID });
    if (!videoExists) {
      return { error: `Video with ID '${videoId}' does not exist.` };
    }

    try {
      const result = await this.videos.deleteOne({ _id: videoId as ID });
      if (result.deletedCount === 0) {
        // This case indicates a problem even if videoExists was true,
        // suggesting a race condition or unexpected database behavior.
        return { error: `Failed to remove video with ID '${videoId}'.` };
      }
      return {}; // Return an empty object for successful completion
    } catch (e) {
      console.error("Error removing video:", e);
      return { error: "Failed to remove video due to a database error." };
    }
  }

  /**
   * _getVideoDetails(videoId: String): (video: {videoId: String, sourceType: String, url: String})[]
   *
   * This is an example of a query that would typically be used to retrieve
   * the full details of a video, addressing the "retrieve and view the video content"
   * part of the concept's principle more directly than the `getVideo` action.
   *
   * **requires** The video with the specified `videoId` exists.
   *
   * **effects** Returns an array containing the full video object (including videoId, sourceType, and url).
   *             Returns an empty array if the video is not found.
   */
  async _getVideoDetails(
    { videoId }: { videoId: string },
  ): Promise<
    Array<{ video: { videoId: string; sourceType: string; url: string } }>
  > {
    const video = await this.videos.findOne({ _id: videoId as ID });
    if (!video) {
      return []; // Queries return an array, so an empty array for not found
    }
    return [{
      video: {
        videoId: video._id,
        sourceType: video.sourceType,
        url: video.url,
      },
    }];
  }
}
```