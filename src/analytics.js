// analytics.js
import { PostHog } from "posthog-node";

// Initialize PostHog client
const client = new PostHog("phc_6Q1Lzrq9R0ZL6STL5y4oz7tmdpYBBmClnhfMhj1D3x3", {
  host: "https://us.i.posthog.com",
  flushAt: 1, // send immediately (good for CLI tools) here
});

/**
 * Track an event in PostHog here
 * @param {string} eventName - Name of the eventtttt
 * @param {object} properties - Extra properties about the event
 * @param {string} userId - Optional unique ID for the user
 */
export function trackEvent(eventName, properties = {}, userId = "anonymous") {
  try {
    client.capture({
      distinctId: userId,
      event: eventName,
      properties,
    });
  } catch (err) {
    // fail silently; don't block CLI
    console.error("⚠️ Analytics error:", err.message);
  }
}
