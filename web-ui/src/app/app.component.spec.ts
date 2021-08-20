import { HarnessLoader, TestElement } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterTestingModule } from "@angular/router/testing";
import { of } from "rxjs";
import { AppComponent } from "./app.component";
import { Project } from "./entities/project.model";
import { User } from "./entities/user.model";
import { getRandomProjects, getRandomUser } from "./mocks/fake-generator";
import { MatToolbarHarness } from "@angular/material/toolbar/testing";
import { MatMenuHarness, MatMenuItemHarness } from "@angular/material/menu/testing";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { selectProjects } from "@mlaide/state/project/project.selectors";
import { selectCurrentUser } from "@mlaide/state/user/user.selectors";
import { selectIsUserAuthenticated } from "@mlaide/state/auth/auth.selectors";
import { initializeLogin, login, logout } from "@mlaide/state/auth/auth.actions";

describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  // fakes
  let fakeProjects: Project[];
  let fakeUser: User;

  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;
  beforeEach(async () => {
    // setup fakes
    fakeProjects = await getRandomProjects(3);
    fakeUser = await getRandomUser();

    TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
      ],
      imports: [BrowserAnimationsModule, MatIconModule, MatMenuModule, MatToolbarModule, RouterTestingModule],
      declarations: [AppComponent],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectCurrentUser, fakeUser);
    store.overrideSelector(selectIsUserAuthenticated, true);
    store.overrideSelector(selectProjects, fakeProjects);

    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should create the app", () => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  describe("constructor", () => {
    it("should select user from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.user$.subscribe((user) => {
        expect(user).toBe(fakeUser);
        done();
      });
    });

    it("should select isUserAuthenticated from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isUserAuthenticated$.subscribe((isUserAuthenticated) => {
        expect(isUserAuthenticated).toBe(true);
        done();
      });
    });

    it("should select projects from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.projects$.subscribe((projects) => {
        expect(projects).toBe(fakeProjects);
        done();
      });
    });

    it("should dispatch initializeLogin action", () => {
      // arrange + act in beforeEach

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(initializeLogin());
    });
  });

  describe("login", () => {
    it("should dispatch login action with targetUrl: /projects", () => {
      // arrange in beforeEach

      // act
      component.login();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(login({ targetUrl: "/projects" }));
    });
  });

  describe("logout", () => {
    it("should dispatch logout", () => {
      // arrange in beforeEach

      // act
      component.logout();

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(logout());
    });
  });

  describe("component rendering", () => {
    describe("tool bar", () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = TestbedHarnessEnvironment.loader(fixture);
      });

      it("should contain mat tool bar", async () => {
        // arrange
        const toolbar: MatToolbarHarness = await loader.getHarness(MatToolbarHarness);

        // assert
        expect(toolbar).toBeTruthy();
      });

      it("should contain correct labels when not authenticated", async () => {
        // arrange
        component.isUserAuthenticated$ = of(false);
        const toolbar: MatToolbarHarness = await loader.getHarness(MatToolbarHarness);

        // assert
        expect((await toolbar.getRowsAsText())[0]).toEqual("ML AideloginLogin");
      });

      it("should contain correct labels when authenticated", async () => {
        // arrange also in beforeEach
        const toolbar: MatToolbarHarness = await loader.getHarness(MatToolbarHarness);

        // assert
        expect((await toolbar.getRowsAsText())[0]).toEqual("ML AideProjects " + fakeUser.nickName);
      });

      it("should contain ml aide button", async () => {
        // arrange
        const mlAideButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#ml-aide-button" }));

        // assert
        expect(mlAideButton).toBeTruthy();
      });

      it("should have correct link for ml aide button", async () => {
        // arrange + act also in beforeEach
        const mlAideButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#ml-aide-button" }));

        // assert
        const aElement: TestElement = await mlAideButton.host();
        expect(await aElement.getAttribute("href")).toEqual("/");
      });

      it("should contain login button when not authenticated", async () => {
        // arrange
        component.isUserAuthenticated$ = of(false);
        const loginButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#login-button" }));

        // assert
        expect(loginButton).toBeTruthy();
      });

      it("should call login on clicking login button", async () => {
        // arrange
        component.isUserAuthenticated$ = of(false);
        const loginButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#login-button" }));
        spyOn(component, "login");

        // act
        await loginButton.click();

        // assert
        expect(component.login).toHaveBeenCalled();
      });

      it("should contain two menus when authenticated", async () => {
        // arrange
        const menus: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // assert
        expect(menus.length).toBe(2);
      });

      it("should contain projects and user menu when authenticated", async () => {
        // arrange
        const [projectsMenu, userMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // assert
        expect(await projectsMenu.getTriggerText()).toEqual("Projects");
        expect(await userMenu.getTriggerText()).toEqual(fakeUser.nickName);
      });

      it("should not contain menus when not authenticated", async () => {
        // arrange
        component.isUserAuthenticated$ = of(false);
        const menus: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // assert
        expect(menus.length).toEqual(0);
      });

      it("should open and close projects menu", async () => {
        // arrange
        const [projectsMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // act + assert
        expect(await projectsMenu.isOpen()).toBe(false);
        await projectsMenu.open();
        expect(await projectsMenu.isOpen()).toBe(true);
        await projectsMenu.close();
        expect(await projectsMenu.isOpen()).toBe(false);
      });

      it("should open and close user menu", async () => {
        // arrange
        const [, userMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // act + assert
        expect(await userMenu.isOpen()).toBe(false);
        await userMenu.open();
        expect(await userMenu.isOpen()).toBe(true);
        await userMenu.close();
        expect(await userMenu.isOpen()).toBe(false);
      });

      it("should contain all project menu items", async () => {
        // arrange
        const [projectsMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // act
        await projectsMenu.open();
        const menuItems: MatMenuItemHarness[] = await projectsMenu.getItems();

        // assert
        expect((await projectsMenu.getItems()).length).toBe(fakeProjects.length + 1);
        expect(await menuItems[0].getText()).toEqual(fakeProjects[0].name);
        expect(await menuItems[1].getText()).toEqual(fakeProjects[1].name);
        expect(await menuItems[2].getText()).toEqual(fakeProjects[2].name);
        expect(await menuItems[3].getText()).toEqual("Show all");
      });

      it("should contain all user menu items", async () => {
        // arrange
        const [, userMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // act
        await userMenu.open();
        const menuItems: MatMenuItemHarness[] = await userMenu.getItems();

        // assert
        expect((await userMenu.getItems()).length).toBe(2);
        expect(await menuItems[0].getText()).toEqual("settingsSettings");
        expect(await menuItems[1].getText()).toEqual("exit_to_appLogout");
      });

      it("should have correct links for project menu entries", async (done) => {
        // arrange + act also in beforeEach
        const [projectsMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // act
        await projectsMenu.open();
        const menuItems: MatMenuItemHarness[] = await projectsMenu.getItems();

        // assert
        await Promise.all(menuItems.map(async (menuItem, index) => {
          const aElement: TestElement = await menuItem.host();

          if (index < menuItems.length - 1) {
            expect(await aElement.getAttribute("href")).toEqual(`/projects/${fakeProjects[index].key}`);
          } else {
            expect(await aElement.getAttribute("href")).toEqual("/projects");
            done();
          }
        }));
      });

      it("should have correct links for user menu entries", async () => {
        // arrange + act also in beforeEach
        const [, userMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // act
        await userMenu.open();
        const menuItems: MatMenuItemHarness[] = await userMenu.getItems();

        // assert
        const aElement: TestElement = await menuItems[0].host();
        expect(await aElement.getAttribute("href")).toEqual("/user-settings/user-profile");
      });

      it("should call logout on clicking logout button in user menu", async () => {
        // arrange
        const [, userMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);
        spyOn(component, "logout");

        // act
        await userMenu.open();
        const menuItems: MatMenuItemHarness[] = await userMenu.getItems();
        await menuItems[1].click();

        // assert
        expect(component.logout).toHaveBeenCalled();
      });
    });
  });
});
