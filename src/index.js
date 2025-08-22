import { getStagedDiff } from "./git.js";
import { generateMessage } from "./generator.js";
import { execSync } from "child_process";
import { select, input } from "@inquirer/prompts";
import { writeFileSync } from "fs";
import os from "os";
import path from "path";
import chalk from "chalk";
import ora from "ora";

export default async function run() {
  const args = process.argv.slice(2);

  const diff = getStagedDiff();
  if (!diff.trim()) {
    console.log(chalk.yellow("⚠️  No staged changes found."));
    process.exit(1);
  }

  // Handle interactive mode (e.g., commit-gen -3)
  if (args[0] && args[0].startsWith("-")) {
    const count = parseInt(args[0].slice(1), 10);

    if (!isNaN(count)) {
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

      // let user pick one with beautiful select
      const choice = await select({
        message: chalk.cyan("📝 Pick a commit message:"),
        choices: options.map((option, index) => ({
          name: chalk.white(`${index + 1}. ${option}`),
          value: option,
        })),
      });

      // let user edit it with beautiful input
      const final = await input({
        message: chalk.cyan("✏️  Edit commit message before committing:"),
        default: choice,
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
        } catch (error) {
          commitSpinner.fail(chalk.red("❌ Commit failed!"));
          console.error(chalk.red(error.message));
        }
      } else {
        console.log(chalk.red("❌ Empty commit message, aborting."));
      }
      return;
    }
  }

  // Default single-message flow
  const spinner = ora(chalk.blue("🎯 Generating commit message...")).start();
  const message = await generateMessage(diff);
  spinner.succeed(chalk.green("✨ Generated commit message!"));

  const commitSpinner = ora(chalk.blue("🚀 Committing changes...")).start();
  try {
    execSync(`git commit -m "${message}"`, { stdio: "inherit" });
    commitSpinner.succeed(chalk.green("✅ Commit successful!"));
  } catch (error) {
    commitSpinner.fail(chalk.red("❌ Commit failed!"));
    console.error(chalk.red(error.message));
  }
}
