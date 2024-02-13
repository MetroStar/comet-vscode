import {
  ExtensionContext,
  OutputChannel,
  commands,
  window,
  workspace,
} from "vscode";
import {
  createProjectDirectory,
  getPackageJson,
  getRootPath,
  getViteConfig,
} from "./utils/file-system";
import { getRepoUrl } from "./utils/git-helpers";
import { runTerminalCommands } from "./utils/terminal-helpers";

export function activate(context: ExtensionContext) {
  const channel = getOutputChannel();
  const terminal = window.createTerminal({ name: "Comet Assistant" });
  const rootPath = getRootPath(workspace);
  if (rootPath) {
    // Verify if package.json exists
    getPackageJson(rootPath).then((config) => {
      if (config) {
        commands.executeCommand(
          "setContext",
          "comet-vscode.hasPackageJson",
          true
        );
      }
    });
    // Verify if vite.config.ts exists
    getViteConfig(rootPath).then((config) => {
      if (config) {
        commands.executeCommand(
          "setContext",
          "comet-vscode.hasViteConfig",
          true
        );
      }
    });
  }

  context.subscriptions.push(
    commands.registerCommand("comet-vscode.start", async () => {
      // Get destination folder
      window
        .showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
          openLabel: "Select destination",
        })
        .then((folderUris) => {
          // If no folder selected, stop the process
          if (!folderUris || folderUris.length === 0) {
            return;
          }
          // Get the first folder selected
          const folderUri = folderUris[0];
          const folderPath = folderUri.fsPath;
          const folderName = folderPath.split("/").pop();

          // Get the name of the new project from the user
          window
            .showInputBox({
              value: folderName,
              prompt: "Enter the name of the new Comet project",
            })
            .then((folderNameInput) => {
              // If no folder name entered, stop the process
              if (!folderNameInput) {
                return;
              }

              // Get the type of the new project from the user
              window
                .showQuickPick(["React with TypeScript", "Python Fast API"], {
                  placeHolder: "Select a Comet project type",
                })
                .then((projectType) => {
                  // If no project type selected, stop the process
                  if (!projectType) {
                    return;
                  }

                  // Create the project directory and clone into the directory
                  createProjectDirectory(folderPath, folderNameInput, channel);
                  terminal.show();

                  const setup: string[] = [
                    `cd ${folderPath}`,
                    `git clone ${getRepoUrl(projectType)} ${folderNameInput}`,
                    `cd ${folderNameInput}`,
                  ];
                  runTerminalCommands(setup, terminal);

                  const cleanup: string[] = [
                    `rm LICENSE.md || true`,
                    `rm .github/workflows/accessibility-testing.yaml || true`,
                    `rm .github/workflows/build-and-deploy.yaml || true`,
                    `rm .github/workflows/e2e-testing.yaml || true`,
                    "git add .",
                    "git commit -m 'Misc cleanup'",
                    "git remote remove origin",
                  ];
                  runTerminalCommands(cleanup, terminal);

                  window.showInformationMessage(
                    "Project created successfully!"
                  );
                });
            });
        });
    })
  );

  context.subscriptions.push(
    commands.registerCommand("comet-vscode.add", async () => {
      terminal.show();

      // Install dev dependencies
      const installDevDeps: string[] = ["npm i -D autoprefixer"];
      runTerminalCommands(installDevDeps, terminal);

      // Install dependencies
      const installDeps: string[] = [
        "npm i @metrostar/comet-uswds @metrostar/comet-extras @metrostar/comet-data-viz",
        "npm i @uswds/uswds",
        "npm i @tanstack/react-table",
      ];
      runTerminalCommands(installDeps, terminal);

      // TODO: Add uswds alias to vite.config.ts
      // TODO: Add css preprocessor to vite.config.ts
      // TODO: Add base USWDS provider files
      // TODO: Add import to styles.scss

      window.showInformationMessage("Comet added successfully!");
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

let _channel: OutputChannel;
export function getOutputChannel(show = true): OutputChannel {
  if (!_channel) {
    _channel = window.createOutputChannel("Comet Assistant");
    if (show) {
      _channel.show();
    }
  }
  return _channel;
}
