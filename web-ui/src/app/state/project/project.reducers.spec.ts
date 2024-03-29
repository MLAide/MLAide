import { getRandomProject, getRandomProjects } from "@mlaide/mocks/fake-generator";
import { loadProjects, loadProjectsFailed, loadProjectsSucceeded, loadProjectSucceeded } from "./project.actions";
import { projectsReducer } from "./project.reducers";
import { ProjectState } from "@mlaide/state/project/project.state";

describe("ProjectReducers", () => {
  describe("loadProjectSucceeded action", () => {
    it("should update currentProject in projectState", async () => {
      // arrange
      const initialState: Partial<ProjectState> = {
        currentProject: await getRandomProject()
      };
      const newProject = await getRandomProject();
      const action = loadProjectSucceeded({project: newProject});

      // act
      const newState = projectsReducer(initialState as ProjectState, action);

      // assert
      expect(newState.currentProject).toEqual(newProject);
    });
  });

  describe("loadProjects action", () => {
    it("should set isLoading to true in projectState", async () => {
      // arrange
      const initialState: Partial<ProjectState> = {
        isLoading: false
      };
      const action = loadProjects();

      // act
      const newState = projectsReducer(initialState as ProjectState, action);

      // assert
      await expect(newState.isLoading).toBeTrue();
    });
  });

  describe("loadProjectsSucceeded action", () => {
    it("should update all projects", async () => {
      // arrange
      const initialState: Partial<ProjectState> = {
        isLoading: true,
        items: await getRandomProjects(3),
      };
      const newProjects = await getRandomProjects(4);
      const action = loadProjectsSucceeded({ projects: newProjects });

      // act
      const newState = projectsReducer(initialState as ProjectState, action);

      // assert
      expect(newState.isLoading).toEqual(false);
      expect(newState.items).toEqual(newProjects);
    });
  });

  describe("loadProjectsFailed action", () => {
    it("should set isLoading to false in projectState", async () => {
      // arrange
      const initialState: Partial<ProjectState> = {
        isLoading: true
      };
      const action = loadProjectsFailed(undefined);

      // act
      const newState = projectsReducer(initialState as ProjectState, action);

      // assert
      await expect(newState.isLoading).toBeFalse();
    });
  });
});
