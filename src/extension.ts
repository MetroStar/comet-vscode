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
} from "./utils/file-system";
import { API_REPO_URL, UI_REPO_URL } from "./constants";
import { getRepoUrl } from "./utils/git-helpers";

export function activate(context: ExtensionContext) {
  const channel = getOutputChannel();
  const terminal = window.createTerminal({ name: "Comet Assistant" });
  const rootPath = getRootPath(workspace);
  if (rootPath) {
    // TODO: Use getPackageJson to get project details
    getPackageJson(rootPath).then((config) => {
      // If package.json exists, set the context to true
      if (config) {
        commands.executeCommand("setContext", "comet-vscode.hasComet", true);
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
                  terminal.sendText(`cd ${folderPath}`);
                  terminal.sendText(
                    `git clone ${getRepoUrl(projectType)} ${folderNameInput}`
                  );
                  terminal.sendText(`cd ${folderNameInput}`);
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
      window.showInformationMessage("This feature is not yet implemented.");
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
