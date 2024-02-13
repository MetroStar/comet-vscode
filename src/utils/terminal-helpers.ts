import { Terminal } from "vscode";

export const runTerminalCommands = async (
  commands: string[],
  terminal: Terminal
) => {
  commands.forEach((command) => {
    terminal.sendText(command);
  });
};
