import { getStagedDiff } from "./git.js";
import { generateMessage } from "./generator.js";
import { execSync } from "child_process";
import { select, input } from "@inquirer/prompts";
import { writeFileSync } from "fs";
import os from "os";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { PostHog } from "posthog-node";

const client = new PostHog("phc_6Q1Lzrq9R0ZL6STL5y4oz7tmdpYBBmClnhfMhj1D3x3", {
  host: "https://us.i.posthog.com",
});

// Helper function to track events
function trackEvent(eventName, properties = {}) {
  try {
    client.capture({
      distinctId: `user_${Math.random().toString(36).substr(2, 9)}`,
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
    });
  } catch (error) {
    // Silently fail if tracking fails
    console.error("Tracking error:", error.message);
  }
}

export default async function run() {
  const args = process.argv.slice(2);
  const command =
    process.argv[1].split("/").pop() || process.argv[1].split("\\").pop();
  const fullCommand = `${command} ${args.join(" ")}`.trim();

  // Track CLI run
  trackEvent("cli_run", {
    command: fullCommand,
    args: args,
    aliasUsed: command === "cg" || command === "git-commit-gen",
    hasStagedChanges: false, // Will update after checking
  });

  const diff = getStagedDiff();
  if (!diff.trim()) {
    trackEvent("no_staged_changes", {
      command: fullCommand,
    });
    console.log(chalk.yellow("⚠️  No staged changes found."));
    process.exit(1);
  }

  // Update tracking with staged changes info
  trackEvent("staged_changes_found", {
    command: fullCommand,
    diffLength: diff.length,
    hasMultipleFiles: diff.includes("\n"),
  });

  // Handle interactive mode (e.g., commit-gen -3)
  if (args[0] && args[0].startsWith("-")) {
    const count = parseInt(args[0].slice(1), 10);

    if (!isNaN(count)) {
      trackEvent("multi_message_mode", {
        command: fullCommand,
        requestedCount: count,
      });

      // Show loading spinner while generating messages
      const spinner = ora(
        chalk.blue("🎯 Generating commit message options...")
      ).start();

      // generate N messages
      const options = [];
      for (let i = 0; i < count; i++) {
        options.push(await generateMessage(diff, i));
      }

      spinner.succeed(
        chalk.green(`✨ Generated ${count} commit message options!`)
      );

      trackEvent("messages_generated", {
        command: fullCommand,
        generatedCount: count,
        actualCount: options.length,
      });

      // let user pick one with beautiful select
      const choice = await select({
        message: chalk.cyan("📝 Pick a commit message:"),
        choices: options.map((option, index) => ({
          name: chalk.white(`${index + 1}. ${option}`),
          value: option,
        })),
      });

      trackEvent("message_selected", {
        command: fullCommand,
        selectedIndex: options.indexOf(choice),
        selectedMessage: choice,
      });

      // let user edit it with beautiful input
      const final = await input({
        message: chalk.cyan("✏️  Edit commit message before committing:"),
        default: choice,
      });

      trackEvent("message_edited", {
        command: fullCommand,
        wasEdited: final !== choice,
        originalLength: choice.length,
        finalLength: final.length,
      });

      // create temp file
      const tempFile = path.join(os.tmpdir(), "commit-msg.txt");
      writeFileSync(tempFile, final, "utf8");

      if (final.trim().length > 0) {
        const commitSpinner = ora(
          chalk.blue("🚀 Committing changes...")
        ).start();
        try {
          // execSync(`git commit -m "${final}"`, { stdio: "inherit" }); for single  line
          execSync(`git commit -F "${tempFile}"`, { stdio: "inherit" });
          commitSpinner.succeed(chalk.green("✅ Commit successful!"));

          trackEvent("commit_successful", {
            command: fullCommand,
            messageLength: final.length,
            usedMultiMode: true,
          });
        } catch (error) {
          commitSpinner.fail(chalk.red("❌ Commit failed!"));
          console.error(chalk.red(error.message));

          trackEvent("commit_failed", {
            command: fullCommand,
            error: error.message,
            usedMultiMode: true,
          });
        }
      } else {
        trackEvent("empty_commit_aborted", {
          command: fullCommand,
          usedMultiMode: true,
        });
        console.log(chalk.red("❌ Empty commit message, aborting."));
      }
      return;
    }
  }

  // Default single-message flow
  trackEvent("single_message_mode", {
    command: fullCommand,
  });

  const spinner = ora(chalk.blue("🎯 Generating commit message...")).start();
  const message = await generateMessage(diff);
  spinner.succeed(chalk.green("✨ Generated commit message!"));

  trackEvent("single_message_generated", {
    command: fullCommand,
    messageLength: message.length,
  });

  const commitSpinner = ora(chalk.blue("🚀 Committing changes...")).start();
  try {
    execSync(`git commit -m "${message}"`, { stdio: "inherit" });
    commitSpinner.succeed(chalk.green("✅ Commit successful!"));

    trackEvent("commit_successful", {
      command: fullCommand,
      messageLength: message.length,
      usedMultiMode: false,
    });
  } catch (error) {
    commitSpinner.fail(chalk.red("❌ Commit failed!"));
    console.error(chalk.red(error.message));

    trackEvent("commit_failed", {
      command: fullCommand,
      error: error.message,
      usedMultiMode: false,
    });
  }
}
