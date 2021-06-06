import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { MatNavListHarness, MatNavListItemHarness } from "@angular/material/list/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatDrawerHarness } from "@angular/material/sidenav/testing";
import { MatIconHarness, MatIconTestingModule } from "@angular/material/icon/testing";
import { getRandomProject } from "../../../mocks/fake-generator";
import { ProjectComponent } from "./project.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ProjectsApiService } from "../../../services";
import { Project } from "../../../entities/project.model";
import { Observable, of, Subscription } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { MatButtonHarness } from "@angular/material/button/testing";

describe("ProjectComponent", () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;
  let loader: HarnessLoader;

  // fakes
  let fakeProject: Project;

  // route spy
  let unsubscriptionSpy: jasmine.Spy<() => void>;

  // service stubs
  let projectsApiServiceStub: jasmine.SpyObj<ProjectsApiService>;

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
    projectsApiServiceStub = jasmine.createSpyObj("projectsApiService", ["getProject"]);

    // setup project fakes
    fakeProject = await getRandomProject();

    // setup users api
    projectsApiServiceStub.getProject.and.returnValue(of(fakeProject));

    TestBed.configureTestingModule({
      declarations: [ProjectComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: paramMapObservable } },
        { provide: ProjectsApiService, useValue: projectsApiServiceStub },
      ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatListModule,
        MatIconTestingModule,
        MatSidenavModule,
        RouterTestingModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it("should create", async () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should load project with projectKey defined in active route", async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.project).toEqual(fakeProject);
    });
  });

  describe("component rendering", () => {
    describe("side navigation", () => {
      it("should contain a side navigation", async () => {
        const sideNav: MatDrawerHarness = await loader.getHarness(MatDrawerHarness);

        expect(sideNav).toBeTruthy();
      });

      it("should contain navigation bar title", () => {
        const h2: HTMLElement = fixture.nativeElement.querySelector("h2");

        expect(h2.textContent).toContain(fakeProject.name);
      });

      it("should contain five links", async () => {
        const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
        const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();

        expect(sideNavLinks.length).toBe(5);
      });

      it("should contain experiments link with icon science and text Experiments and href /projects/project.key/experiments", async () => {
        const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
        const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();
        const link: MatNavListItemHarness = sideNavLinks[0];
        const icons: MatIconHarness[] = await loader.getAllHarnesses(MatIconHarness);
        const icon: MatIconHarness = icons[0];

        expect(await link.getHref()).toEqual(`/projects/${fakeProject.key}/experiments`);
        expect(await link.hasIcon()).toBeTruthy();
        expect(await icon.getName()).toEqual("science");
        expect((await link.getLinesText()).length).toEqual(1);
        expect((await link.getLinesText())[0]).toContain("Experiments");
      });

      it("should contain runs link with icon play_for_work and text Runs and href /projects/project.key/runs", async () => {
        const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
        const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();
        const link: MatNavListItemHarness = sideNavLinks[1];
        const icons: MatIconHarness[] = await loader.getAllHarnesses(MatIconHarness);
        const icon: MatIconHarness = icons[1];

        expect(await link.getHref()).toEqual(`/projects/${fakeProject.key}/runs`);
        expect(await link.hasIcon()).toBeTruthy();
        expect(await icon.getName()).toEqual("play_for_work");
        expect((await link.getLinesText()).length).toEqual(1);
        expect((await link.getLinesText())[0]).toContain("Runs");
      });

      it("should contain models link with icon model_training and text Models and href /projects/project.key/models", async () => {
        const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
        const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();
        const link: MatNavListItemHarness = sideNavLinks[2];
        const icons: MatIconHarness[] = await loader.getAllHarnesses(MatIconHarness);
        const icon: MatIconHarness = icons[2];

        expect(await link.getHref()).toEqual(`/projects/${fakeProject.key}/models`);
        expect(await link.hasIcon()).toBeTruthy();
        expect(await icon.getName()).toEqual("model_training");
        expect((await link.getLinesText()).length).toEqual(1);
        expect((await link.getLinesText())[0]).toContain("Models");
      });

      it("should contain artifacts link with icon text_snippet and text Artifacts and href /projects/project.key/artifacts", async () => {
        const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
        const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();
        const link: MatNavListItemHarness = sideNavLinks[3];
        const icons: MatIconHarness[] = await loader.getAllHarnesses(MatIconHarness);
        const icon: MatIconHarness = icons[3];

        expect(await link.getHref()).toEqual(`/projects/${fakeProject.key}/artifacts`);
        expect(await link.hasIcon()).toBeTruthy();
        expect(await icon.getName()).toEqual("text_snippet");
        expect((await link.getLinesText()).length).toEqual(1);
        expect((await link.getLinesText())[0]).toContain("Artifacts");
      });

      it("should contain settings link with icon settings and text Artifacts and href /projects/project.key/settings", async () => {
        const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
        const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();
        const link: MatNavListItemHarness = sideNavLinks[4];
        const icons: MatIconHarness[] = await loader.getAllHarnesses(MatIconHarness);
        const icon: MatIconHarness = icons[4];

        expect(await link.getHref()).toEqual(`/projects/${fakeProject.key}/settings`);
        expect(await link.hasIcon()).toBeTruthy();
        expect(await icon.getName()).toEqual("settings");
        expect((await link.getLinesText()).length).toEqual(1);
        expect((await link.getLinesText())[0]).toContain("Settings");
      });

      it("sidenav should be toggleable", async () => {
        // arrange
        const drawer: MatDrawerHarness = await loader.getHarness(MatDrawerHarness);
        const toggleButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#nav-toggle-button" }));

        // assert
        expect(await drawer.isOpen()).toBe(true);

        // act
        await toggleButton.click();
        // assert
        expect(await drawer.isOpen()).toBe(false);

        // act
        await toggleButton.click();
        // assert
        expect(await drawer.isOpen()).toBe(true);
      });
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
});
