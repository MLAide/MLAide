import { getRandomProjects } from "@mlaide/mocks/fake-generator";
import { loadProjectsSucceeded } from "./project.actions";
import { projectsReducer } from "./project.reducers";
import { ProjectState } from "@mlaide/state/project/project.state";

describe("ProjectReducer", () => {
  describe("loadProjectsSucceeded action", () => {
    it("should update all projects", async () => {
      // arrange
      const initialState: ProjectState = {
        isLoading: true,
        items: await getRandomProjects(3),
      };
      const newProjects = await getRandomProjects(4);
      const action = loadProjectsSucceeded({ projects: newProjects });

      // act
      const newState = projectsReducer(initialState, action);

      // assert
      expect(newState).toEqual({ isLoading: true, items: newProjects});
    });
  });
});
