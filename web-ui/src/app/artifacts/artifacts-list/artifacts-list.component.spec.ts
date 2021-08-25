import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MockComponent, ngMocks } from "ng-mocks";
import { getRandomArtifacts, getRandomProject } from "@mlaide/mocks/fake-generator";

import { ArtifactsListComponent } from "./artifacts-list.component";
import { ArtifactsListTableComponent } from "@mlaide/shared/components/artifacts-list-table/artifacts-list-table.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { selectArtifacts, selectIsLoadingArtifacts } from "@mlaide/state/artifact/artifact.selectors";
import { selectCurrentProjectKey } from "@mlaide/state/project/project.selectors";
import { loadArtifacts } from "@mlaide/state/artifact/artifact.actions";
import { Project } from "@mlaide/state/project/project.models";
import { Artifact } from "@mlaide/state/artifact/artifact.models";

describe("ArtifactsListComponent", () => {
  let component: ArtifactsListComponent;
  let fixture: ComponentFixture<ArtifactsListComponent>;

  // fake
  let fakeProject: Project;
  let fakeArtifacts: Artifact[];

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // arrange fakes & stubs
    // setup fakes
    fakeProject = await getRandomProject();
    fakeArtifacts = await getRandomArtifacts(3);

    await TestBed.configureTestingModule({
      declarations: [ArtifactsListComponent, MockComponent(ArtifactsListTableComponent)],
      providers: [
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectArtifacts, fakeArtifacts);
    store.overrideSelector(selectCurrentProjectKey, fakeProject.key);
    store.overrideSelector(selectIsLoadingArtifacts, true);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtifactsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select artifacts from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.artifacts$.subscribe((artifacts) => {
        expect(artifacts).toBe(fakeArtifacts);
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

    it("should select isLoadingArtifacts from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoadingArtifacts$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });

    it("should dispatch loadArtifacts action", () => {
      // arrange + act in beforeEach

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(loadArtifacts());
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Artifacts");
    });

    it("should contain child component with correct attributes - app-artifacts-list-table", async () => {
      // arrange
      const artifactsListTableComponent = ngMocks
        .find<ArtifactsListTableComponent>('app-artifacts-list-table')
        .componentInstance;

      // assert
      expect(artifactsListTableComponent.artifacts$).toBe(component.artifacts$);
      expect(artifactsListTableComponent.projectKey).toBe(fakeProject.key);
      expect(artifactsListTableComponent.isLoading$).toBe(component.isLoadingArtifacts$);
    });
  });
});
