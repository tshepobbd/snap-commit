import Command from "./Command.js";
import inquirer from "inquirer";
import { writeFileSync } from "fs";
import os from "os";
import path from "path";
import { ValidationError } from "../errors/CustomError.js";
import { getLogger } from "../utils/Logger.js";

export class InteractiveCommitCommand extends Command {
  constructor(gitService, messageGenerator, config) {
    super();
    this.gitService = gitService;
    this.messageGenerator = messageGenerator;
    this.config = config;
    this.logger = getLogger();
  }

  canHandle(args) {
    return (
      args[0] &&
      args[0].startsWith("-") &&
      !isNaN(parseInt(args[0].slice(1), 10))
    );
  }

  async execute(args) {
    const count = parseInt(args[0].slice(1), 10);

    if (count <= 0) {
      throw new ValidationError("Message count must be positive");
    }

    const diff = this.gitService.getStagedDiff();
    if (!this.gitService.hasStagedChanges()) {
      return;
    }

    // Generate multiple messages
    const options = [];
    for (let i = 0; i < count; i++) {
      const message = await this.messageGenerator.generate(diff, i);
      options.push(message);
    }

    // Let user pick one
    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "Pick a commit message:",
        choices: options,
      },
    ]);

    // Let user edit it
    const { final } = await inquirer.prompt([
      {
        type: "editor",
        name: "final",
        message: "Edit commit message before committing:",
        default: choice,
      },
    ]);

    if (final.trim().length === 0) {
      this.logger.error("Empty commit message, aborting.");
      return;
    }

    // Create temp file and commit
    const tempFile = path.join(
      os.tmpdir(),
      `${this.config.cli.tempFilePrefix}.txt`
    );
    writeFileSync(tempFile, final, "utf8");

    this.gitService.commit(tempFile, true);
  }

  getHelp() {
    return "Usage: commit-gen -N\nGenerates N commit message options and allows interactive selection";
  }
}

export default InteractiveCommitCommand;
