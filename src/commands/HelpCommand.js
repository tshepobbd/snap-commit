import Command from "./Command.js";

export class HelpCommand extends Command {
  constructor(commands) {
    super();
    this.commands = commands;
  }

  canHandle(args) {
    return args.includes("--help") || args.includes("-h") || args.includes("help");
  }

  async execute(args) {
    console.log("🤖 Commit Message Generator");
    console.log("==========================\n");
    
    console.log("Usage:");
    console.log("  commit-gen              Generate and commit with a single message");
    console.log("  commit-gen -N           Generate N message options and select interactively");
    console.log("  commit-gen --help       Show this help message\n");
    
    console.log("Examples:");
    console.log("  commit-gen              # Quick commit with AI-generated message");
    console.log("  commit-gen -3           # Choose from 3 AI-generated options");
    console.log("  commit-gen -5           # Choose from 5 AI-generated options\n");
    
    console.log("Environment Variables:");
    console.log("  OPENAI_API_KEY          Your OpenAI API key (required)");
    console.log("  OPENAI_MODEL            OpenAI model to use (default: gpt-3.5-turbo)");
    console.log("  OPENAI_TEMPERATURE      Temperature for AI generation (default: 0.7)");
    console.log("  COMMIT_MAX_LENGTH       Max commit message length (default: 72)");
    console.log("  ENABLE_CONVENTIONAL_COMMITS Enable conventional commit format (default: true)");
  }

  getHelp() {
    return "Shows help information and usage examples";
  }
}

export default HelpCommand;
