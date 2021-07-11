import { Project } from "./project.models";

export interface ProjectState {
  items: Project[];
  isLoading: boolean;
}