import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MockComponent } from "ng-mocks";
import { Observable, Subscription } from "rxjs";
import { Artifact, ArtifactListResponse } from "src/app/core/models/artifact.model";
import { Project } from "src/app/core/models/project.model";
import { ArtifactsApiService } from "src/app/core/services";
import { ListDataSourceMock } from "src/app/mocks/data-source.mock";
import { getRandomProject } from "src/app/mocks/fake-generator";
import { ArtifactsListTableComponent } from "../shared/artifacts-list-table/artifacts-list-table.component";

import { ArtifactsListComponent } from "./artifacts-list.component";

describe("ArtifactsListComponent", () => {
  let component: ArtifactsListComponent;
  let fixture: ComponentFixture<ArtifactsListComponent>;

  // fake
  let fakeProject: Project;

  // route spy
  let unsubscriptionSpy: jasmine.Spy<() => void>;

  // service stubs
  let artifactsApiServiceStub: jasmine.SpyObj<ArtifactsApiService>;

  // data source mocks
  let artifactListDataSourceMock: ListDataSourceMock<Artifact, ArtifactListResponse> = new ListDataSourceMock();

  beforeEach(async () => {
    // mock active route params
    const paramMapObservable = new Observable<ParamMap>();
    const paramMapSubscription = new Subscription();
    unsubscriptionSpy = spyOn(paramMapSubscription, "unsubscribe").and.callThrough();
    spyOn(paramMapObservable, "subscribe").and.callFake(
      (fn): Subscription => {
        fn({ projectKey: fakeProject.key });
        return paramMapSubscription;
      }
    );

    // stub services
    artifactsApiServiceStub = jasmine.createSpyObj("artifactsApiService", ["getArtifacts"]);

    // arrange fakes & stubs
    // setup fakes
    fakeProject = await getRandomProject();

    // setup artifacts api
    artifactsApiServiceStub.getArtifacts.and.returnValue(artifactListDataSourceMock);

    await TestBed.configureTestingModule({
      declarations: [ArtifactsListComponent, MockComponent(ArtifactsListTableComponent)],
      providers: [
        { provide: ActivatedRoute, useValue: { params: paramMapObservable } },
        { provide: ArtifactsApiService, useValue: artifactsApiServiceStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtifactsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    artifactListDataSourceMock.emulate([]);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should load artifacts with projectKey defined in active route", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.projectKey).toBe(fakeProject.key);
      expect(artifactsApiServiceStub.getArtifacts).toHaveBeenCalledWith(fakeProject.key, false);
    });

    it("should load all artifacts of the current project", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.artifactListDataSource).toBe(artifactListDataSourceMock);
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from routeParamsSubscription", async () => {
      // arrange in beforeEach

      // act
      component.ngOnDestroy();

      // assert
      expect(unsubscriptionSpy).toHaveBeenCalled();
    });
  });

  describe("component rendering", () => {
    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Artifacts");
    });

    it("should contain child component - app-artifacts-list-table", async () => {
      // arrange
      const childComponent: HTMLElement = fixture.nativeElement.querySelector("app-artifacts-list-table");

      // assert
      expect(childComponent).toBeTruthy();
      expect(childComponent.getAttribute("ng-reflect-project-key")).toEqual(fakeProject.key);
      expect(childComponent.getAttribute("ng-reflect-artifact-list-data-source")).not.toBeUndefined();
      expect(childComponent.getAttribute("ng-reflect-artifact-list-data-source")).not.toBeNull();
    });
  });
});
