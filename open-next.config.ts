import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No ISR or data cache is used (every page renders per request for the CSP
// nonce), so no incremental cache backend is configured.
export default defineCloudflareConfig({});
