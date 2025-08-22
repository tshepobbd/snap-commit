import { getStagedDiff } from "./git.js";
import { generateMessage } from "./generator.js";
import { execSync } from "child_process";
import inquirer from "inquirer";
import { writeFileSync } from "fs";
import os from "os";
import path from "path";

export default async function run() {
  const args = process.argv.slice(2);

  const diff = getStagedDiff();
  if (!diff.trim()) {
    console.log("⚠️ No staged changes found.");
    process.exit(1);
  }

  // Handle interactive mode (e.g., commit-gen -3)
  if (args[0] && args[0].startsWith("-")) {
    const count = parseInt(args[0].slice(1), 10);

    if (!isNaN(count)) {
      // generate N messages
      const options = [];
      for (let i = 0; i < count; i++) {
        options.push(await generateMessage(diff, i));
      }

      // let user pick one
      const { choice } = await inquirer.prompt([
        {
          type: "list",
          name: "choice",
          message: "Pick a commit message:",
          choices: options,
        },
      ]);

      // let user edit it
      const { final } = await inquirer.prompt([
        {
          type: "editor",
          name: "final",
          message: "Edit commit message before committing:",
          default: choice,
        },
      ]);

      // create temp file
      const tempFile = path.join(os.tmpdir(), "commit-msg.txt");
      writeFileSync(tempFile, final, "utf8");

      if (final.trim().length > 0) {
        // execSync(`git commit -m "${final}"`, { stdio: "inherit" }); for single  line
        execSync(`git commit -F "${tempFile}"`, { stdio: "inherit" });
      } else {
        console.log("❌ Empty commit message, aborting.");
      }
      return;
    }
  }

  // Default single-message flow
  const message = await generateMessage(diff);
  execSync(`git commit -m "${message}"`, { stdio: "inherit" });
}
