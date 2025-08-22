import { getConfig } from "../config/index.js";
import { GitService } from "../services/GitService.js";
import { CommitMessageGeneratorFactory } from "../factories/CommitMessageGeneratorFactory.js";
import { CommandRegistry } from "../commands/CommandRegistry.js";
import { InteractiveCommitCommand } from "../commands/InteractiveCommitCommand.js";
import { SimpleCommitCommand } from "../commands/SimpleCommitCommand.js";
import { HelpCommand } from "../commands/HelpCommand.js";
import { handleError } from "../errors/CustomError.js";
import { getLogger } from "../utils/Logger.js";

export class CommitGenerator {
  constructor() {
    this.config = getConfig();
    this.gitService = new GitService();
    this.messageGenerator = CommitMessageGeneratorFactory.createWithFallback(
      this.config
    );
    this.commandRegistry = new CommandRegistry();
    this.logger = getLogger();

    this.initializeCommands();
  }

  initializeCommands() {
    // Register commands in order of specificity
    this.commandRegistry.register(
      new HelpCommand(this.commandRegistry.getAllCommands())
    );
    this.commandRegistry.register(
      new InteractiveCommitCommand(
        this.gitService,
        this.messageGenerator,
        this.config
      )
    );
    this.commandRegistry.register(
      new SimpleCommitCommand(this.gitService, this.messageGenerator)
    );
  }

  async run() {
    try {
      // Validate environment
      this.validateEnvironment();

      // Get command line arguments
      const args = process.argv.slice(2);

      // Find and execute appropriate command
      const command = this.commandRegistry.findCommand(args);

      if (command) {
        await command.execute(args);
      } else {
        this.logger.error("Unknown command. Use --help for usage information.");
        process.exit(1);
      }
    } catch (error) {
      handleError(error);
    }
  }

  validateEnvironment() {
    // Validate git repository
    this.gitService.validateGitRepository();

    // Validate configuration
    const configErrors = this.config.validate();
    if (configErrors.length > 0) {
      this.logger.warning("Configuration warnings:");
      configErrors.forEach((error) => this.logger.warning(`  - ${error}`));
    }
  }
}

export default CommitGenerator;
