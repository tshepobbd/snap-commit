import Command from "./Command.js";
import { getLogger } from "../utils/Logger.js";

export class SimpleCommitCommand extends Command {
  constructor(gitService, messageGenerator) {
    super();
    this.gitService = gitService;
    this.messageGenerator = messageGenerator;
    this.logger = getLogger();
  }

  canHandle(args) {
    return !args.length || args.length === 0;
  }

  async execute(args) {
    const diff = this.gitService.getStagedDiff();
    if (!this.gitService.hasStagedChanges()) {
      return;
    }

    const message = await this.messageGenerator.generate(diff);
    this.gitService.commit(message, false);
  }

  getHelp() {
    return "Usage: commit-gen\nGenerates a single commit message and commits immediately";
  }
}

export default SimpleCommitCommand;
