import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatNavListHarness, MatNavListItemHarness } from "@angular/material/list/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatDrawerHarness } from "@angular/material/sidenav/testing";
import { MatIconHarness, MatIconTestingModule } from "@angular/material/icon/testing";
import { getRandomProject } from "@mlaide/mocks/fake-generator";
import { ProjectComponent } from "./project.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { RouterTestingModule } from "@angular/router/testing";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { loadProject } from "@mlaide/state/project/project.actions";
import { AppState } from "@mlaide/state/app.state";
import { ProjectState } from "@mlaide/state/project/project.state";
import { Project } from "@mlaide/state/project/project.models";

describe("ProjectComponent", () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;
  let loader: HarnessLoader;

  // fakes
  let fakeProject: Project;

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // setup project fakes
    fakeProject = await getRandomProject();
    const appState: Partial<AppState> = {
      projects: {
        currentProject: fakeProject
      } as ProjectState
    }

    await TestBed.configureTestingModule({
      declarations: [ProjectComponent],
      providers: [
        provideMockStore({ initialState: appState })
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

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
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
    it("should dispatch load project", async () => {
      // arrange + act in beforeEach

      // assert
      expect(dispatchSpy).toHaveBeenCalledOnceWith(loadProject());
    });

    it("should subscribe to current project", (done) => {
      // arrange + act in beforeEach

      // assert
      component.project$.subscribe(project => {
        expect(project).toBe(fakeProject);

        done();
      })
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

      it("should contain experiment link with icon science and text Experiments and href /projects/project.key/experiment", async () => {
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
});
