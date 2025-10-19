---
timestamp: 'Sat Oct 18 2025 21:45:49 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251018_214549.a0289d34.md]]'
content_id: 50ec1b2286e4aa055cac577a63f776f7f2a803f33bef102d25dd68a01bacba7b
---

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

```
getVideo(videoId: String): (video: Video)
    effect:
        return the video with the specified videoId

removeVideo(videoId: String)
    requires:
        video with videoId exists
    effect:
        remove video from Videos
```
