import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MockComponent } from "ng-mocks";
import { Observable, Subscription } from "rxjs";
import { Project } from "@mlaide/entities/project.model";
import { Run, RunListResponse } from "@mlaide/entities/run.model";
import { RunsApiService } from "src/app/services";
import { ListDataSourceMock } from "src/app/mocks/data-source.mock";
import { getRandomProject } from "src/app/mocks/fake-generator";
import { RunsListComponent } from "./runs-list.component";
import { RunsListTableComponent } from "src/app/shared/components/runs-list-table/runs-list-table.component";

describe("RunsListComponent", () => {
  let component: RunsListComponent;
  let fixture: ComponentFixture<RunsListComponent>;

  // fake
  let fakeProject: Project;

  // route spy
  let unsubscriptionSpy: jasmine.Spy<() => void>;

  // service stubs
  let runsApiServiceStub: jasmine.SpyObj<RunsApiService>;

  // data source mocks
  let runListDataSourceMock: ListDataSourceMock<Run, RunListResponse> = new ListDataSourceMock();

  beforeEach(async () => {
    // mock active route params
    const paramMapObservable = new Observable<ParamMap>();
    const paramMapSubscription = new Subscription();
    unsubscriptionSpy = spyOn(paramMapSubscription, "unsubscribe").and.callThrough();
    spyOn(paramMapObservable, "subscribe").and.callFake((fn): Subscription => {
      fn({ projectKey: fakeProject.key });
      return paramMapSubscription;
    });

    // stub services
    runsApiServiceStub = jasmine.createSpyObj("runsApiService", ["getRuns"]);

    // arrange fakes & stubs
    // setup fakes
    fakeProject = await getRandomProject();

    // setup artifacts api
    runsApiServiceStub.getRuns.and.returnValue(runListDataSourceMock);

    await TestBed.configureTestingModule({
      declarations: [RunsListComponent, MockComponent(RunsListTableComponent)],
      providers: [
        { provide: ActivatedRoute, useValue: { params: paramMapObservable } },
        { provide: RunsApiService, useValue: runsApiServiceStub },
      ],
    }).compileComponents();
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
    it("should load runs with projectKey defined in active route and save it to component projectKey", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.projectKey).toBe(fakeProject.key);
      expect(runsApiServiceStub.getRuns).toHaveBeenCalledWith(fakeProject.key);
    });

    it("should load all artifacts of the current project", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.runListDataSource).toBe(runListDataSourceMock);
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
      expect(h1.textContent).toEqual("Runs");
    });

    it("should contain child component - app-runs-list-table ", async () => {
      // arrange
      const childComponent: HTMLElement = fixture.nativeElement.querySelector("app-runs-list-table");

      // assert
      expect(childComponent).toBeTruthy();
      expect(childComponent.getAttribute("ng-reflect-project-key")).toEqual(fakeProject.key);
      expect(childComponent.getAttribute("ng-reflect-run-list-data-source")).not.toBeUndefined();
      expect(childComponent.getAttribute("ng-reflect-run-list-data-source")).not.toBeNull();
    });
  });
});
