export class Command {
  constructor() {
    if (this.constructor === Command) {
      throw new Error("Command is an abstract class");
    }
  }

  async execute(args) {
    throw new Error("execute method must be implemented");
  }

  canHandle(args) {
    throw new Error("canHandle method must be implemented");
  }

  getHelp() {
    return "No help available for this command";
  }
}

export default Command;
