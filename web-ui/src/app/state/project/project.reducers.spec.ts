import { getRandomProjects } from "@mlaide/mocks/fake-generator";
import { ProjectState } from "../app.state";
import { loadProjectsSucceeded } from "./project.actions";
import { projectsReducer } from "./project.reducers";

fdescribe("ProjectReducer", () => {
  describe("loadProjectsSucceeded action", () => {
    it("should update all projects", async () => {
      // arrange
      const initialState: ProjectState = {
        items: await getRandomProjects(3)
      };
      const newProjects = await getRandomProjects(4);
      const action = loadProjectsSucceeded({ projects: newProjects });

      // act
      const newState = projectsReducer(initialState, action);

      // assert
      expect(newState).toEqual({ items: newProjects });
    });
  });
});
