import { HarnessLoader, TestElement } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterTestingModule } from "@angular/router/testing";
import { of, Subject } from "rxjs";
import { AppComponent } from "./app.component";
import { AuthService } from "./auth/auth.service";
import { Project, ProjectListResponse } from "./entities/project.model";
import { User } from "./entities/user.model";
import { ProjectsApiService, UsersApiService } from "./shared/services";
import { ListDataSourceMock } from "./mocks/data-source.mock";
import { getRandomProjects, getRandomUser } from "./mocks/fake-generator";
import { MatToolbarHarness } from "@angular/material/toolbar/testing";
import { MatMenuHarness, MatMenuItemHarness } from "@angular/material/menu/testing";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatButtonHarness } from "@angular/material/button/testing";

describe("AppComponent", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let authServiceIsAuthenticated$;

  // fakes
  let fakeProjects: Project[];
  let fakeUser: User;

  // service stubs
  let authServiceStub: jasmine.SpyObj<AuthService>;
  let projectsApiServiceStub: jasmine.SpyObj<ProjectsApiService>;
  let usersApiServiceStub: jasmine.SpyObj<UsersApiService>;

  // data source mocks
  let projectListDataSourceMock: ListDataSourceMock<Project, ProjectListResponse> = new ListDataSourceMock();

  beforeEach(async () => {
    authServiceIsAuthenticated$ = new Subject<boolean>();

    // stub services
    authServiceStub = jasmine.createSpyObj("authService", ["loginWithUserInteraction", "logout", "runInitialLoginSequence"]);
    authServiceStub.isAuthenticated$ = authServiceIsAuthenticated$;
    projectsApiServiceStub = jasmine.createSpyObj("projectApiService", ["getProjects"]);
    usersApiServiceStub = jasmine.createSpyObj("usersApiService", ["getCurrentUser"]);

    // setup fakes
    fakeProjects = await getRandomProjects(3);
    fakeUser = await getRandomUser();

    // setup project api
    projectsApiServiceStub.getProjects.and.returnValue(projectListDataSourceMock);
    projectListDataSourceMock.emulate(fakeProjects);

    // setup users api
    usersApiServiceStub.getCurrentUser.and.returnValue(of(fakeUser));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: ProjectsApiService, useValue: projectsApiServiceStub },
        { provide: UsersApiService, useValue: usersApiServiceStub },
      ],
      imports: [BrowserAnimationsModule, MatIconModule, MatMenuModule, MatToolbarModule, RouterTestingModule],
      declarations: [AppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    projectListDataSourceMock.emulate([]);
  });

  it("should create the app", () => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  describe("constructor", () => {
    it("should load current user when isAuthenticated emits true", async () => {
      // arrange + act in beforeEach
      authServiceIsAuthenticated$.next(true);

      // assert
      expect(usersApiServiceStub.getCurrentUser).toHaveBeenCalled();
      expect(component.user).toEqual(fakeUser);
    });

    it("should not load current user when isAuthenticated emits false", async () => {
      // arrange + act in beforeEach
      authServiceIsAuthenticated$.next(false);

      // assert
      expect(usersApiServiceStub.getCurrentUser).not.toHaveBeenCalled();
      expect(component.user).toBeUndefined();
    });

    it("should call runInitialLoginSequence", async () => {
      // arrange + act in beforeEach

      // assert
      expect(authServiceStub.runInitialLoginSequence).toHaveBeenCalled();
    });
  });

  describe("ngOnInit", () => {
    it("should load projects when isAuthenticated emits true", async () => {
      // arrange + act in beforeEach
      authServiceIsAuthenticated$.next(true);

      // assert
      expect(projectsApiServiceStub.getProjects).toHaveBeenCalled();
      expect(component.projects).toEqual(fakeProjects);
    });

    it("should not load projects when isAuthenticated emits false", async () => {
      // arrange + act in beforeEach
      authServiceIsAuthenticated$.next(false);

      // assert
      expect(projectsApiServiceStub.getProjects).not.toHaveBeenCalled();
      expect(component.projects).toBeUndefined();
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe projectListSubscription", async () => {
      // arrange also in beforeEach
      authServiceIsAuthenticated$.next(true);
      spyOn(component["projectListSubscription"], "unsubscribe");

      // act
      component.ngOnDestroy();

      // assert
      expect(component["projectListSubscription"].unsubscribe).toHaveBeenCalled();
    });

    it("should unsubscribe isAuthenticatedSubscription", async () => {
      // arrange also in beforeEach
      spyOn(component["isAuthenticatedSubscription"], "unsubscribe");

      // act
      component.ngOnDestroy();

      // assert
      expect(component["isAuthenticatedSubscription"].unsubscribe).toHaveBeenCalled();
    });

    it("should unsubscribe isAuthenticatedSubscriptionForProjects", async () => {
      // arrange also in beforeEach
      spyOn(component["isAuthenticatedSubscriptionForProjects"], "unsubscribe");

      // act
      component.ngOnDestroy();

      // assert
      expect(component["isAuthenticatedSubscriptionForProjects"].unsubscribe).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should call loginWithUserInteraction", async () => {
      // arrange + act in beforeEach
      component.login();

      // assert
      expect(authServiceStub.loginWithUserInteraction).toHaveBeenCalledWith("/projects");
    });
  });

  describe("logout", () => {
    it("should call logout", async () => {
      // arrange + act in beforeEach
      component.logout();

      // assert
      expect(authServiceStub.logout).toHaveBeenCalled();
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
        const toolbar: MatToolbarHarness = await loader.getHarness(MatToolbarHarness);
        authServiceIsAuthenticated$.next(false);

        // assert
        expect((await toolbar.getRowsAsText())[0]).toEqual("ML AideloginLogin");
      });

      it("should contain correct labels when authenticated", async () => {
        // arrange
        const toolbar: MatToolbarHarness = await loader.getHarness(MatToolbarHarness);
        authServiceIsAuthenticated$.next(true);

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
        authServiceIsAuthenticated$.next(false);
        const loginButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#login-button" }));

        // assert
        expect(loginButton).toBeTruthy();
      });

      it("should call login on clicking login button", async () => {
        // arrange
        authServiceIsAuthenticated$.next(false);
        const loginButton: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: "#login-button" }));
        spyOn(component, "login");

        // act
        await loginButton.click();

        // assert
        expect(component.login).toHaveBeenCalled();
      });

      it("should contain two menus when authenticated", async () => {
        // arrange
        authServiceIsAuthenticated$.next(true);
        const menus: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // assert
        expect(menus.length).toBe(2);
      });

      it("should contain projects and user menu when authenticated", async () => {
        // arrange
        authServiceIsAuthenticated$.next(true);
        const [projectsMenu, userMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // assert
        expect(await projectsMenu.getTriggerText()).toEqual("Projects");
        expect(await userMenu.getTriggerText()).toEqual(fakeUser.nickName);
      });

      it("should not contain menus when not authenticated", async () => {
        // arrange
        authServiceIsAuthenticated$.next(false);
        const menus: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // assert
        expect(menus.length).toEqual(0);
      });

      it("should open and close projects menu", async () => {
        // arrange
        authServiceIsAuthenticated$.next(true);
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
        authServiceIsAuthenticated$.next(true);
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
        authServiceIsAuthenticated$.next(true);
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
        authServiceIsAuthenticated$.next(true);
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
        authServiceIsAuthenticated$.next(true);
        const [projectsMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // act
        await projectsMenu.open();
        const menuItems: MatMenuItemHarness[] = await projectsMenu.getItems();

        // assert
        menuItems.forEach(async (menuItem, index) => {
          const aElement: TestElement = await menuItem.host();

          if (index < menuItems.length - 1) {
            expect(await aElement.getAttribute("href")).toEqual(`/projects/${fakeProjects[index].key}`);
          } else {
            expect(await aElement.getAttribute("href")).toEqual("/projects");
            done();
          }
        });
      });

      it("should have correct links for user menu entries", async () => {
        // arrange + act also in beforeEach
        authServiceIsAuthenticated$.next(true);
        const [, userMenu]: MatMenuHarness[] = await loader.getAllHarnesses(MatMenuHarness);

        // act
        await userMenu.open();
        const menuItems: MatMenuItemHarness[] = await userMenu.getItems();

        // assert
        const aElement: TestElement = await menuItems[0].host();
        expect(await aElement.getAttribute("href")).toEqual("/user-settings/user");
      });

      it("should call logout on clicking logout button in user menu", async () => {
        // arrange
        authServiceIsAuthenticated$.next(true);
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
