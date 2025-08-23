import chalk from "chalk";

export class OpenAIProvider {
  constructor() {
    // Backend service URL - update this to your deployed URL
    this.backendUrl =
      process.env.SNAP_COMMIT_BACKEND_URL || "https://snap-commit.onrender.com";
    this.model = "gpt-3.5-turbo";
  }

  async generateCommitMessages(diff, count = 3) {
    try {
      //console.log("This backend url is", this.backendUrl); made a fix
      const response = await fetch(`${this.backendUrl}/api/generate-commit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diff: diff,
          count: count,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (response.status === 429) {
          throw new Error(
            `Rate limit exceeded. Please try again in ${
              errorData.retryAfter || 60
            } seconds.`
          );
        }

        if (response.status === 503) {
          throw new Error(
            "Service temporarily unavailable. Please try again later."
          );
        }

        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.messages)) {
        throw new Error("Invalid response from backend service");
      }

      // Log batching info if available
      if (data.chunksProcessed && data.chunksProcessed > 1) {
        console.log(
          chalk.blue(
            `📦 Processed ${data.chunksProcessed} chunks for large diff`
          )
        );
      }

      return data.messages;
    } catch (error) {
      console.error("Failed to generate commit messagess:", error.message);

      // Return fallback messages
      return [
        "chore: update code",
        "fix: resolve issues",
        "feat: add new functionality",
      ].slice(0, count);
    }
  }

  getModel() {
    return this.model;
  }
}
