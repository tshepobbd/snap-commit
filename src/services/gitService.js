import { execSync } from "child_process";

export class GitService {
  /**
   * Get the diff of staged changes
   * @returns {string} The staged diff
   */
  static getStagedDiff() {
    try {
      const diff = execSync("git diff --cached", { encoding: "utf8" });
      
      if (!diff?.trim()) {
        return null;
      }
      
      return diff;
    } catch (error) {
      throw new Error(`Failed to get staged diff: ${error.message}`);
    }
  }

  /**
   * Get staged files list
   * @returns {Array} List of staged files
   */
  static getStagedFiles() {
    try {
      const files = execSync("git diff --cached --name-only", { encoding: "utf8" });
      return files.split('\n').filter(Boolean);
    } catch (error) {
      throw new Error(`Failed to get staged files: ${error.message}`);
    }
  }

  /**
   * Commit with a message
   * @param {string} message - Commit message
   * @param {string} tempFile - Temporary file path for multi-line commits
   */
  static commit(message, tempFile = null) {
    try {
      if (tempFile) {
        execSync(`git commit -F "${tempFile}"`, { stdio: "inherit" });
      } else {
        execSync(`git commit -m "${message}"`, { stdio: "inherit" });
      }
      return true;
    } catch (error) {
      throw new Error(`Commit failed: ${error.message}`);
    }
  }

  static undoLastCommit() {
  try {
    execSync("git reset --soft HEAD~1", { stdio: "inherit" });
    return true;
  } catch (error) {
    throw new Error(`Undo last commit failed: ${error.message}`);
  }
}

  /**
   * Check if we're in a git repository
   * @returns {boolean}
   */
  static isGitRepository() {
    try {
      execSync("git rev-parse --git-dir", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
}