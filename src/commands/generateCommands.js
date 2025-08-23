import { select, input, confirm } from "@inquirer/prompts";
import { writeFileSync } from "fs";
import os from "os";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import readline from "readline";
import { GitService } from "../services/gitService.js";
import { AIService } from "../services//generatorService.js";
import { AnalyticsService } from "../services/analyticService.js";

export class GenerateCommand {
  constructor() {
    this.git = GitService;
    this.ai = new AIService();
    this.analytics = new AnalyticsService();
  }

  async execute(args) {
    const command = this.getCommandName();
    const fullCommand = `${command} ${args.join(" ")}`.trim();

    // Track CLI run
    this.analytics.trackEvent("cli_run", {
      command: fullCommand,
      args: args,
      aliasUsed:
        command === "cg" ||
        command === "git-commit-gen" ||
        command === "commit-gen",
    });

    // Check if in git repository
    if (!this.git.isGitRepository()) {
      console.log(chalk.red("❌ Not a git repository"));
      console.log(chalk.yellow("Initialize a git repository first: git init"));
      process.exit(1);
    }

    // Get staged diff
    const diff = this.git.getStagedDiff();
    if (!diff) {
      this.analytics.trackEvent("no_staged_changes", { command: fullCommand });
      console.log(chalk.yellow("⚠️  No staged changes found."));
      console.log(chalk.gray("Use 'git add <files>' to stage changes"));
      process.exit(1);
    }

    // Detect languages
    const languages = this.ai.detectLanguages(diff);
    if (languages.length > 0) {
      console.log(chalk.cyan(`📝 Languages detected: ${languages.join(", ")}`));
    }
    //udno last commit
    if (args.includes("--undo")) {
      await this.undoLastCommit(fullCommand);
      return;
    }

    // Handle multi-message mode (e.g., commit-gen -3)
    if (args[0]?.startsWith("-")) {
      const count = parseInt(args[0].slice(1), 10);
      if (!isNaN(count) && count > 0) {
        await this.handleMultiMessageMode(diff, count, fullCommand);
        return;
      }
    }

    // Default single-message mode
    await this.handleSingleMessageMode(diff, fullCommand);
  }

  async handleMultiMessageMode(diff, count, fullCommand) {
    this.analytics.trackEvent("multi_message_mode", {
      command: fullCommand,
      requestedCount: count,
    });

    const spinner = ora(
      chalk.blue("🎯 Generating commit message options...")
    ).start();

    try {
      const messages = await this.ai.generateMessages(diff, count);
      spinner.succeed(
        chalk.green(`✨ Generated ${messages.length} commit message options!`)
      );

      // Let user pick one
      const choice = await select({
        message: chalk.cyan("📝 Pick a commit message:"),
        choices: messages.map((option, index) => ({
          name: chalk.white(`${index + 1}. ${option}`),
          value: option,
        })),
      });

      this.analytics.trackEvent("message_selected", {
        command: fullCommand,
        selectedIndex: messages.indexOf(choice),
      });

      // Show selected message
      // console.log(chalk.cyan("\n📝 Selected message:"));
      // console.log(chalk.white.bold(`  ${choice}\n`));

      // Ask if user wants to edit
      const wantsToEdit = await confirm({
        message: chalk.cyan("✏️  Do you want to edit this message?"),
        default: false,
      });

      let final = choice;

      if (wantsToEdit) {
        // Use custom readline to properly pre-fill text
        final = await this.editMessage(choice);
      }

      this.analytics.trackEvent("message_edited", {
        command: fullCommand,
        wasEdited: final !== choice,
        userChoseToEdit: wantsToEdit,
      });

      // Commit
      if (final.trim().length > 0) {
        await this.commitMessage(final, fullCommand, true);
      } else {
        console.log(chalk.red("❌ Empty commit message, aborting."));
      }
    } catch (error) {
      spinner.fail(chalk.red("❌ Failed to generate messages"));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  }

  async handleSingleMessageMode(diff, fullCommand) {
    this.analytics.trackEvent("single_message_mode", { command: fullCommand });

    const spinner = ora(chalk.blue("🎯 Generating commit message...")).start();

    try {
      const message = await this.ai.generateSingleMessage(diff);
      spinner.succeed(chalk.green("✨ Generated commit message!"));

      // console.log(chalk.cyan("\n📝 Commit message:"));
      // console.log(chalk.white.bold(`  ${message}\n`));

      await this.commitMessage(message, fullCommand, false);
    } catch (error) {
      spinner.fail(chalk.red("❌ Failed to generate message"));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  }

  async commitMessage(message, fullCommand, isMultiLine) {
    const commitSpinner = ora(chalk.blue("🚀 Committing changes...")).start();

    try {
      let tempFile = null;

      if (isMultiLine || message.includes("\n")) {
        tempFile = path.join(os.tmpdir(), "snap-commit-msg.txt");
        writeFileSync(tempFile, message, "utf8");
      }

      this.git.commit(message, tempFile);
      commitSpinner.succeed(chalk.green("✅ Commit successful!"));

      this.analytics.trackEvent("commit_successful", {
        command: fullCommand,
        messageLength: message.length,
        isMultiLine,
      });

      // Ensure proper exit after successful commit
      process.exit(0);
    } catch (error) {
      commitSpinner.fail(chalk.red("❌ Commit failed!"));
      console.error(chalk.red(error.message));

      this.analytics.trackEvent("commit_failed", {
        command: fullCommand,
        error: error.message,
      });

      // Ensure proper exit after failed commit
      process.exit(1);
    }
  }

  async undoLastCommit(fullCommand) {
    this.analytics.trackEvent("undo_last_commit_attempt", {
      command: fullCommand,
    });

    // Ask for confirmation
    const proceed = await confirm({
      message: chalk.yellow(
        "⚠️  Are you sure you want to undo the last commit? (changes will be staged)"
      ),
      default: false,
    });

    if (!proceed) {
      console.log(chalk.cyan("ℹ️  Undo cancelled."));
      this.analytics.trackEvent("undo_last_commit_cancelled", {
        command: fullCommand,
      });
      return;
    }

    const spinner = ora(chalk.blue("⏪ Undoing last commit...")).start();

    try {
      this.git.undoLastCommit();
      spinner.succeed(
        chalk.green(
          "✅ Last commit has been undone (changes restored to staging)."
        )
      );

      this.analytics.trackEvent("undo_last_commit_success", {
        command: fullCommand,
      });
    } catch (error) {
      spinner.fail(chalk.red("❌ Failed to undo last commit."));
      console.error(chalk.red(error.message));

      this.analytics.trackEvent("undo_last_commit_failed", {
        command: fullCommand,
        error: error.message,
      });
    }
  }

  async editMessage(currentMessage) {
    return new Promise((resolve) => {
      // Pause stdin to prevent conflicts
      process.stdin.pause();

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      // Pre-fill the input with the current message
      process.stdout.write(chalk.cyan("✏️  Edit commit message: "));
      rl.write(currentMessage);

      rl.on("line", (input) => {
        rl.close();
        // Resume stdin after closing
        process.stdin.resume();
        resolve(input.trim() || currentMessage);
      });

      // Handle cleanup on close
      rl.on("close", () => {
        process.stdin.resume();
      });
    });
  }

  getCommandName() {
    return (
      process.argv[1].split("/").pop() || process.argv[1].split("\\").pop()
    );
  }
}
