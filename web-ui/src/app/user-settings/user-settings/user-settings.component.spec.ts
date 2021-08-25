import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatNavListHarness, MatNavListItemHarness } from "@angular/material/list/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDividerModule } from "@angular/material/divider";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatDrawerHarness } from "@angular/material/sidenav/testing";
import { MatIconHarness, MatIconTestingModule } from "@angular/material/icon/testing";

import { UserSettingsComponent } from "./user-settings.component";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { HarnessLoader } from "@angular/cdk/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { MatButtonHarness } from "@angular/material/button/testing";

describe("UserSettingsComponent", () => {
  let component: UserSettingsComponent;
  let fixture: ComponentFixture<UserSettingsComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserSettingsComponent],
      providers: [],
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
    fixture = TestBed.createComponent(UserSettingsComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("side navigation", () => {
    it("should contain a side navigation", async () => {
      // arrange
      const sideNav: MatDrawerHarness = await loader.getHarness(MatDrawerHarness);

      // asser
      expect(sideNav).toBeTruthy();
    });

    it("should contain navigation bar title", () => {
      // arrange
      const h2: HTMLElement = fixture.nativeElement.querySelector("h2");

      // assert
      expect(h2.textContent).toContain("User settings");
    });

    it("should contain two links", async () => {
      // arrange
      const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
      const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();

      // assert
      expect(sideNavLinks.length).toBe(2);
    });

    it("first link should contain icon face and text profile and href /user-profile", async () => {
      // arrange
      const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
      const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();
      const profileLink: MatNavListItemHarness = sideNavLinks[0];
      const icons: MatIconHarness[] = await loader.getAllHarnesses(MatIconHarness);
      const firstIcon: MatIconHarness = icons[0];

      // assert
      expect(await profileLink.getHref()).toEqual("/user-profile");
      expect(await profileLink.hasIcon()).toBeTruthy();
      expect(await firstIcon.getName()).toEqual("face");
      expect((await profileLink.getLinesText()).length).toEqual(1);
      expect((await profileLink.getLinesText())[0]).toContain("Profile");
    });

    it("second link should contain icon vpn_key and text API Keys and href /api-keys", async () => {
      // arrange
      const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
      const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();
      const apiKeysLink: MatNavListItemHarness = sideNavLinks[1];
      const icons: MatIconHarness[] = await loader.getAllHarnesses(MatIconHarness);
      const secondIcon: MatIconHarness = icons[1];

      // assert
      expect(await apiKeysLink.getHref()).toEqual("/api-keys");
      expect(await apiKeysLink.hasIcon()).toBeTruthy();
      expect(await secondIcon.getName()).toEqual("vpn_key");
      expect((await apiKeysLink.getLinesText()).length).toEqual(1);
      expect((await apiKeysLink.getLinesText())[0]).toEqual("API Keys");
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
