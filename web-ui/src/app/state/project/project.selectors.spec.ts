import { getRandomProjects } from "@mlaide/mocks/fake-generator";
import { AppState } from "../app.state";
import { selectCurrentProjectKey, selectIsLoadingProjects, selectProjects } from "./project.selectors";
import { ProjectState } from "@mlaide/state/project/project.state";

describe("ProjectSelectors", () => {
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
  describe("selectProjects", () => {
    it("should select projects from state", async () => {
      // arrange
      const state: Partial<AppState> = {
        projects: {
          isLoading: true,
          items: await getRandomProjects(3)
        }
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
});
