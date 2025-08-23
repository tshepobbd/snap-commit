import { GenerateCommand } from "./commands/generateCommands.js";

export default async function run() {
  try {
    const command = new GenerateCommand();
    const args = process.argv.slice(2);

    await command.execute(args);
  } catch (error) {
    console.error("Unexpected error:", error);
    process.exit(1);
  }
}

// Allow direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
