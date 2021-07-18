import { ProjectMemberState } from "@mlaide/state/project-member/project-member.state";
import {
  currentProjectMemberChanged,
  loadProjectMembers,
  loadProjectMembersFailed,
  loadProjectMembersSucceeded
} from "@mlaide/state/project-member/project-member.actions";
import { projectMembersReducer } from "@mlaide/state/project-member/project-member.reducers";
import { getRandomProjectMember, getRandomProjectMembers } from "@mlaide/mocks/fake-generator";

describe("ProjectMemberReducers", () => {
  describe("loadProjectMembers action", () => {
    it("should set isLoading to true in projectMemberState", async () => {
      // arrange
      const initialState: Partial<ProjectMemberState> = {
        isLoading: false
      };
      const action = loadProjectMembers();

      // act
      const newState = projectMembersReducer(initialState as ProjectMemberState, action);

      // assert
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("loadProjectMembersSucceeded action", () => {
    it("should update all project members and set isLoading to false in projectMemberState", async () => {
      // arrange
      const initialState: Partial<ProjectMemberState> = {
        isLoading: true,
        items: await getRandomProjectMembers(3)
      };
      const newProjectMembers = await getRandomProjectMembers(4);
      const action = loadProjectMembersSucceeded({ projectMembers: newProjectMembers } as any);

      // act
      const newState = projectMembersReducer(initialState as ProjectMemberState, action);

      // assert
      await expect(newState.items).toEqual(newProjectMembers);
      await expect(newState.isLoading).toEqual(false);
    });
  });

  describe("loadProjectMembersFailed action", () => {
    it("should set isLoading to false in projectMemberState", async () => {
      // arrange
      const initialState: Partial<ProjectMemberState> = {
        isLoading: true
      };
      const action = loadProjectMembersFailed(undefined);

      // act
      const newState = projectMembersReducer(initialState as ProjectMemberState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });

  describe("currentProjectMemberChanged action", () => {
    it("should update current project member in projectMemberState", async () => {
      // arrange
      const initialState: Partial<ProjectMemberState> = {
        currentProjectMember: await getRandomProjectMember()
      };
      const newProjectMember = await getRandomProjectMember();
      const action = currentProjectMemberChanged({ currentProjectMember: newProjectMember } as any);

      // act
      const newState = projectMembersReducer(initialState as ProjectMemberState, action);

      // assert
      await expect(newState.currentProjectMember).toEqual(newProjectMember);
    });
  });
});
