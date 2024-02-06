import path from "path";
import fs from "fs";

export const getPackageJson = async (rootPath: string) => {
  const filePath = path.join(rootPath, `package.json`);
  try {
    const file = fs.readFileSync(filePath, "utf8");
    if (file === "") {
      return null;
    } else {
      const config = JSON.parse(file);
      return config;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getRootPath = (workspace: any) => {
  return workspace.workspaceFolders && workspace.workspaceFolders.length > 0
    ? workspace.workspaceFolders[0].uri.fsPath
    : undefined;
};

export const createProjectDirectory = async (
  rootPath: string,
  projectName: string,
  channel: any
): Promise<string> => {
  const dirPath = path.join(rootPath, projectName);
  fs.mkdir(dirPath, (err) => {
    if (err) {
      console.error(err);
    } else {
      channel.appendLine("Project Directory created.");
    }
  });

  return dirPath;
};
