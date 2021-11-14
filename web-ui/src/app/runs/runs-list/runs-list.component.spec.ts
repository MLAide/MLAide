import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MockComponent, ngMocks } from "ng-mocks";
import { getRandomProject, getRandomRuns } from "@mlaide/mocks/fake-generator";
import { RunsListComponent } from "./runs-list.component";
import { RunsListTableComponent } from "@mlaide/shared/components/runs-list-table/runs-list-table.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { selectIsLoadingRuns, selectRuns } from "@mlaide/state/run/run.selectors";
import { Run } from "@mlaide/state/run/run.models";
import { Project } from "@mlaide/state/project/project.models";

describe("RunsListComponent", () => {
  let component: RunsListComponent;
  let fixture: ComponentFixture<RunsListComponent>;

  // fake
  let fakeRuns: Run[];
  let fakeProject: Project;

  let store: MockStore;
  beforeEach(async () => {
    // arrange fakes & stubs
    // setup fakes
    fakeRuns = await getRandomRuns(3);
    fakeProject = await getRandomProject();

    await TestBed.configureTestingModule({
      declarations: [RunsListComponent, MockComponent(RunsListTableComponent)],
      providers: [
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectRuns, fakeRuns);
    store.overrideSelector(selectCurrentProjectKey, fakeProject.key);
    store.overrideSelector(selectIsLoadingRuns, true);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select runs from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.runs$.subscribe((runs) => {
        expect(runs).toBe(fakeRuns);
        done();
      });
    });

    it("should select projectKey from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.projectKey$.subscribe((projectKey) => {
        expect(projectKey).toBe(fakeProject.key);
        done();
      });
    });

    it("should select selectIsLoadingRuns from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoadingRuns$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Runs");
    });

    it("should contain child component with correct attributes - app-artifacts-list-table", async () => {
      // arrange
      const runsListTableComponent = ngMocks
        .find<RunsListTableComponent>('app-runs-list-table')
        .componentInstance;

      // assert
      expect(runsListTableComponent.runs$).toBe(component.runs$);
      expect(runsListTableComponent.projectKey).toBe(fakeProject.key);
      expect(runsListTableComponent.isLoading$).toBe(component.isLoadingRuns$);
    });
  });
});
