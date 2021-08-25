import { Project } from "./project.models";

export interface ProjectState {
  currentProject: Project;
  items: Project[];
  isLoading: boolean;
}
