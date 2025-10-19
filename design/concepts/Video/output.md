Video Concept Functionality ...
------- post-test output -------

--- Starting Video Concept Tests ---
----- post-test output end -----
  Action: importVideo - Successfully imports a new video ...
------- post-test output -------

Test: importVideo - Importing video from youtube with URL https://www.youtube.com/watch?v=video1
  - Successfully imported. New video ID: 0199fa28-0996-7ed0-820a-15ffce58239e
  - State verified: video found with correct sourceType and URL.
----- post-test output end -----
  Action: importVideo - Successfully imports a new video ... ok (78ms)
  Action: importVideo - Fails to import a duplicate video ...
------- post-test output -------

Test: importVideo - Attempting to import duplicate video from youtube with URL https://www.youtube.com/watch?v=video1
  - FAILED as expected: A video from 'youtube' with URL 'https://www.youtube.com/watch?v=video1' already exists (ID: 0199fa28-0996-7ed0-820a-15ffce58239e).
----- post-test output end -----
  Action: importVideo - Fails to import a duplicate video ... ok (17ms)
  Action: importVideo - Imports another distinct video ...
------- post-test output -------

Test: importVideo - Importing another distinct video from vimeo with URL https://vimeo.com/videoA
  - Successfully imported. New video ID: 0199fa28-09f4-7d6f-be0f-cde5bd0fab13
----- post-test output end -----
  Action: importVideo - Imports another distinct video ... ok (35ms)
  Action: getVideo - Retrieves an existing video ID ...
------- post-test output -------

Test: getVideo - Retrieving video with ID: 0199fa28-0996-7ed0-820a-15ffce58239e
  - Successfully retrieved video ID: 0199fa28-0996-7ed0-820a-15ffce58239e
----- post-test output end -----
  Action: getVideo - Retrieves an existing video ID ... ok (16ms)
  Action: getVideo - Fails to retrieve a non-existent video ...
------- post-test output -------

Test: getVideo - Attempting to retrieve non-existent video with ID: nonExistentVideo123
  - FAILED as expected: Video with ID 'nonExistentVideo123' not found.
----- post-test output end -----
  Action: getVideo - Fails to retrieve a non-existent video ... ok (16ms)
  Query: _getVideoDetails - Retrieves full details for an existing video ...
------- post-test output -------

Test: _getVideoDetails - Retrieving full details for video ID: 0199fa28-0996-7ed0-820a-15ffce58239e
  - Successfully retrieved video details: {"videoId":"0199fa28-0996-7ed0-820a-15ffce58239e","sourceType":"youtube","url":"https://www.youtube.com/watch?v=video1"}
----- post-test output end -----
  Query: _getVideoDetails - Retrieves full details for an existing video ... ok (17ms)
  Query: _getVideoDetails - Returns empty array for non-existent video ...
------- post-test output -------

Test: _getVideoDetails - Attempting to retrieve details for non-existent video with ID: anotherNonExistentVideo
  - Returned empty array as expected.
----- post-test output end -----
  Query: _getVideoDetails - Returns empty array for non-existent video ... ok (16ms)
  Action: removeVideo - Successfully removes an existing video ...
------- post-test output -------

Test: removeVideo - Removing video with ID: 0199fa28-0996-7ed0-820a-15ffce58239e
  - Successfully removed video ID: 0199fa28-0996-7ed0-820a-15ffce58239e
  - Verification: video is no longer found after removal.
----- post-test output end -----
  Action: removeVideo - Successfully removes an existing video ... ok (52ms)
  Action: removeVideo - Fails to remove a non-existent video ...
------- post-test output -------

Test: removeVideo - Attempting to remove non-existent video with ID: definitelyNotHere
  - FAILED as expected: Video with ID 'definitelyNotHere' does not exist.
----- post-test output end -----
  Action: removeVideo - Fails to remove a non-existent video ... ok (16ms)
  Principle fulfillment: after importing a video, users can retrieve and view it ...
------- post-test output -------

--- Principle Fulfillment Test ---
Principle: after importing a video from an external source with its URL, users can retrieve and view the video content.
  - Step 1: Importing video from youtube with URL https://www.youtube.com/watch?v=video2
    - Video imported with ID: 0199fa28-0a9f-7723-91cd-c0fdca82b534
  - Step 2: Retrieving full video details for ID: 0199fa28-0a9f-7723-91cd-c0fdca82b534
    - Successfully retrieved and verified video details: {"videoId":"0199fa28-0a9f-7723-91cd-c0fdca82b534","sourceType":"youtube","url":"https://www.youtube.com/watch?v=video2"}
  - Principle successfully demonstrated.
----- post-test output end -----
  Principle fulfillment: after importing a video, users can retrieve and view it ... ok (52ms)
------- post-test output -------

--- All Video Concept Tests Completed ---
----- post-test output end -----
Video Concept Functionality ... ok (860ms)

ok | 1 passed (10 steps) | 0 failed (952ms)