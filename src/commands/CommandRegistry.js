export class CommandRegistry {
  constructor() {
    this.commands = [];
  }

  register(command) {
    this.commands.push(command);
  }

  findCommand(args) {
    return this.commands.find(command => command.canHandle(args));
  }

  getAllCommands() {
    return this.commands;
  }

  getHelpText() {
    return this.commands.map(cmd => cmd.getHelp()).join("\n");
  }
}

export default CommandRegistry;
