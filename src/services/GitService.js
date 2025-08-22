import { execSync } from "child_process";
import { GitError } from "../errors/CustomError.js";
import { getConfig } from "../config/index.js";
import { getLogger } from "../utils/Logger.js";

export class GitService {
  constructor() {
    this.config = getConfig();
    this.logger = getLogger();
  }

  getStagedDiff() {
    try {
      return execSync(this.config.git.diffCommand, { encoding: "utf8" });
    } catch (error) {
      throw new GitError(`Failed to get staged diff: ${error.message}`);
    }
  }

  hasStagedChanges() {
    const diff = this.getStagedDiff();
    const hasChanges = diff.trim().length > 0;
    if (!hasChanges) {
      this.logger.warning("No staged changes found.");
    }
    return hasChanges;
  }

  commit(message, useFile = false) {
    try {
      if (useFile) {
        execSync(`${this.config.git.commitCommand} -F "${message}"`, {
          stdio: "inherit",
        });
      } else {
        execSync(`${this.config.git.commitCommand} -m "${message}"`, {
          stdio: "inherit",
        });
      }
    } catch (error) {
      throw new GitError(`Failed to commit: ${error.message}`);
    }
  }

  validateGitRepository() {
    try {
      execSync("git rev-parse --git-dir", { stdio: "ignore" });
      return true;
    } catch (error) {
      throw new GitError("Not a git repository");
    }
  }
}

export default GitService;
