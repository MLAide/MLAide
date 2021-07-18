import { AppState } from "@mlaide/state/app.state";
import {
  selectCurrentProjectMember,
  selectIsLoadingProjectMembers,
  selectProjectMembers
} from "@mlaide/state/project-member/project-member.selectors";
import { ProjectMemberState } from "@mlaide/state/project-member/project-member.state";
import { getRandomProjectMember, getRandomProjectMembers } from "@mlaide/mocks/fake-generator";

describe("ProjectMemberSelectors", () => {
  describe("selectCurrentProjectMember", () => {
    it("should select current project member from state", async () => {
      // arrange
      const partialProjectMemberState: Partial<ProjectMemberState> = {
        currentProjectMember: await getRandomProjectMember()
      }
      const state: Partial<AppState> = {
        projectMembers: partialProjectMemberState as ProjectMemberState
      };

      // act
      const currentProjectMember = selectCurrentProjectMember(state as AppState);

      // assert
      expect(currentProjectMember).toBe(state.projectMembers.currentProjectMember);
    });
  });

  describe("selectIsLoadingProjectMembers", () => {
    it("should select isLoading from state", async () => {
      // arrange
      const partialProjectMemberState: Partial<ProjectMemberState> = {
        isLoading: true
      }
      const state: Partial<AppState> = {
        projectMembers: partialProjectMemberState as ProjectMemberState
      };

      // act
      const isLoading = selectIsLoadingProjectMembers(state as AppState);

      // assert
      expect(isLoading).toBeTrue();
    });
  });

  describe("selectProjectMembers", () => {
    it("should select project members from state", async () => {
      // arrange
      const partialProjectMemberState: Partial<ProjectMemberState> = {
        items: await getRandomProjectMembers(3)
      }
      const state: Partial<AppState> = {
        projectMembers: partialProjectMemberState as ProjectMemberState
      };

      // act
      const projectMembers = selectProjectMembers(state as AppState);

      // assert
      expect(projectMembers).toBe(state.projectMembers.items);
    });
  });
});
