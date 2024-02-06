import { API_REPO_URL, UI_REPO_URL } from "../constants";

export const getRepoUrl = (projectType: string) => {
  if (projectType === "React with TypeScript") {
    return UI_REPO_URL;
  } else if (projectType === "Python Fast API") {
    return API_REPO_URL;
  } else {
    return "";
  }
};
