---
timestamp: 'Sun Oct 19 2025 16:55:01 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_165501.bfca9d07.md]]'
content_id: 206ed8d91a522aba0fa94be889bd8251cc05defe7a2a56715ec259ebeed9244f
---

# response:

It seems the concept implementation itself is correct, and all individual test steps passed. The issue is a resource leak detected by Deno after the tests have completed, specifically related to asynchronous operations and a TLS connection, which strongly suggests that the MongoDB client connection is not being fully closed or awaited at the appropriate time by the top-level test block.

The `Deno.test.afterAll` hook, while logically placed for cleanup, can sometimes resolve before all internal asynchronous operations of `client.close()` are truly complete, leading Deno's strict leak detection to flag lingering resources.

To fix this, we'll move the `await client.close()` call directly to the end of the main `Deno.test` async function. This ensures that the overall test function will not resolve until the client has fully closed and all its associated resources are released, satisfying Deno's leak detection.

Here's the corrected test file:
