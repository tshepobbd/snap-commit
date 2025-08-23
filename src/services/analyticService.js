import { PostHog } from "posthog-node";

export class AnalyticsService {
  constructor() {
    this.client = new PostHog(
      process.env.POSTHOG_KEY || "phc_6Q1Lzrq9R0ZL6STL5y4oz7tmdpYBBmClnhfMhj1D3x3",
      {
        host: "https://us.i.posthog.com",
        flushAt: 1, // Send immediately for CLI tools
      }
    );
    this.userId = this.generateUserId();
  }

  generateUserId() {
    return `user_${Math.random().toString(36).substring(2, 11)}`;
  }

  trackEvent(eventName, properties = {}) {
    try {
      this.client.capture({
        distinctId: this.userId,
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          version: "1.0.5",
          platform: process.platform,
          nodeVersion: process.version,
        },
      });
    } catch (error) {
      // Silently fail - don't block the CLI
      if (process.env.DEBUG) {
        console.error("Analytics error:", error.message);
      }
    }
  }

  async flush() {
    try {
      await this.client.flush();
    } catch (error) {
      // Silently fail
      if (process.env.DEBUG) {
        console.error("Analytics flush error:", error.message);
      }
    }
  }
}