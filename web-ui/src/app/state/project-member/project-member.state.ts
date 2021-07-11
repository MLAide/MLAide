import { ProjectMember } from "./project-member.models";

export interface ProjectMemberState {
  currentProjectMember: ProjectMember;
  isLoading: boolean;
  items: ProjectMember[];
}
