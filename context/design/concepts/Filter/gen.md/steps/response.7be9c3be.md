---
timestamp: 'Sun Oct 19 2025 16:52:06 GMT-0400 (Eastern Daylight Time)'
parent: '[[../20251019_165206.6b6a32c7.md]]'
content_id: 7be9c3beb757fa0f3c2a81c7deb461b902dde9f2348cf84cf4f5ab1b5596cd67
---

# response:

The test failures aren't due to logical errors in your `FilterConcept` implementation or the assertions themselves, as all individual `t.step` tests are passing (`ok (XXms)`). The issue is clearly identified by the `Leaks detected` message, specifically:

* `4 async calls to op_read were started in this test, but never completed.`
* `6 timers were started in this test, but never completed. This is often caused by not calling clearTimeout.`
* `A TLS connection was opened/accepted during the test, but not closed during the test. Close the TLS connection by calling tlsConn.close().`

These messages strongly indicate that the MongoDB client connection (and potentially some other associated resources) is not being cleanly shut down at the end of the entire test suite.

While you correctly placed `await client.close()` within a `Deno.test.afterAll` hook inside your main `Deno.test` block, sometimes the Deno test runner's leak detection can be sensitive to the exact timing and scope. A more robust pattern for resource cleanup that spans an entire `Deno.test` block is to use a `try...finally` block. This guarantees that `client.close()` is called regardless of whether any test steps throw errors.

Here's the updated test file with the `try...finally` block to ensure the MongoDB client is always closed:
