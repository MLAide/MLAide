import { getRandomProjects } from "@mlaide/mocks/fake-generator";
import { AppState } from "../app.state";
import { selectCurrentProjectKey, selectProjects } from "./project.selectors";

describe("ProjectSelectors", () => {
  describe("selectProjects", () => {
    it("should select projects from state", async () => {
      // arrange
      const state: Partial<AppState> = {
        projects: {
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
