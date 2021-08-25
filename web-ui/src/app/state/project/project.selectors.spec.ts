import { getRandomProject, getRandomProjects } from "@mlaide/mocks/fake-generator";
import { AppState } from "@mlaide/state/app.state";
import {
  selectCurrentProject,
  selectCurrentProjectKey,
  selectIsLoadingProjects,
  selectProjects
} from "./project.selectors";
import { ProjectState } from "@mlaide/state/project/project.state";

describe("ProjectSelectors", () => {
  describe("selectCurrentProject", () => {
    it("should select current project from state", async () => {
      // arrange
      const partialProjectState: Partial<ProjectState> = {
        currentProject: await getRandomProject()
      }

      const state: Partial<AppState> = {
        projects: partialProjectState as ProjectState
      };

      // act
      const project = selectCurrentProject(state as AppState);

      // assert
      expect(project).toBe(state.projects.currentProject);
    });
  });

  describe("selectProjects", () => {
    it("should select projects from state", async () => {
      // arrange
      const partialProjectState: Partial<ProjectState> = {
          isLoading: true,
          items: await getRandomProjects(3)
      }

      const state: Partial<AppState> = {
        projects: partialProjectState as ProjectState
      };

      // act
      const projects = selectProjects(state as AppState);

      // assert
      expect(projects).toBe(state.projects.items);
    });
  });

  describe("selectCurrentProjectKey", () => {
    it("should select current project key from router state", async () => {
      // arrange
      const state = {
        router: {
          state: {
            url: "",
            root: {
              params: {
                projectKey: "the-project-key"
              }
            }
          }
        }
      };

      // act
      const projectKey = selectCurrentProjectKey(state as any);

      // assert
      expect(projectKey).toBe("the-project-key");
    });
  });

  describe("selectIsLoadingProjects", () => {
    it("should select isLoading from state", async () => {
      // arrange
      const partialProjectState: Partial<ProjectState> = {
        isLoading: true
      }
      const state: Partial<AppState> = {
        projects: partialProjectState as ProjectState
      };

      // act
      const isLoading = selectIsLoadingProjects(state as AppState);

      // assert
      expect(isLoading).toBeTrue();
    });
  });
});
