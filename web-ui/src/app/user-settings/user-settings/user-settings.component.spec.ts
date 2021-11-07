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
import { MatExpansionModule } from "@angular/material/expansion";
import { MatExpansionPanelHarness } from "@angular/material/expansion/testing";

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
        MatExpansionModule,
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

    it("should be toggleable", async () => {
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

    describe("links", () => {
      it("should contain 3 links", async () => {
        // arrange
        const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
        const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();

        // assert
        expect(sideNavLinks.length).toBe(3);
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

      it("should contain link with text API Keys and href /api-keys", async () => {
        // arrange
        const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
        const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();
        const apiKeysLink: MatNavListItemHarness = sideNavLinks[1];

        // assert
        expect(await apiKeysLink.getHref()).toEqual("/api-keys");
        expect((await apiKeysLink.getText())).toEqual("API Keys");
      });

      it("should contain link with text SSH Keys and href /ssh-keys", async () => {
        // arrange
        const sideNavLinksList: MatNavListHarness = await loader.getHarness(MatNavListHarness);
        const sideNavLinks: MatNavListItemHarness[] = await sideNavLinksList.getItems();
        const sshKeysLink: MatNavListItemHarness = sideNavLinks[2];

        // assert
        expect(await sshKeysLink.getHref()).toEqual("/ssh-keys");
        expect((await sshKeysLink.getText())).toEqual("SSH Keys");
      });
    });

    describe("keys expansion panel", () => {
      it("should contain keys expansion panel", async () => {
        // arrange
        const expansionPanel: MatExpansionPanelHarness = await loader.getHarness(MatExpansionPanelHarness);

        // assert
        expect(expansionPanel).toBeTruthy();
      });

      it("should be expanded", async () => {
        // arrange
        const expansionPanel: MatExpansionPanelHarness = await loader.getHarness(MatExpansionPanelHarness);

        // assert
        expect(await expansionPanel.isExpanded()).toBeTrue();
      });

      it("should have toggle", async () => {
        // arrange
        const expansionPanel: MatExpansionPanelHarness = await loader.getHarness(MatExpansionPanelHarness);

        // assert
        expect(await expansionPanel.hasToggleIndicator()).toBeTrue();
      });

      it("should be toggable", async () => {
        // arrange
        const expansionPanel: MatExpansionPanelHarness = await loader.getHarness(MatExpansionPanelHarness);

        // act
        await expansionPanel.toggle();

        // assert
        expect(await expansionPanel.isExpanded()).toBeFalse();

        // act
        await expansionPanel.toggle();

        // assert
        expect(await expansionPanel.isExpanded()).toBeTrue();
      });

      it("should have title vpn_keyKeys", async () => {
        // arrange
        const expansionPanel: MatExpansionPanelHarness = await loader.getHarness(MatExpansionPanelHarness);


        // assert
        expect(await expansionPanel.getTitle()).toEqual("vpn_keyKeys");
      });

      it("should have text content 'API KeysSSH Keys'", async () => {
        // arrange
        const expansionPanel: MatExpansionPanelHarness = await loader.getHarness(MatExpansionPanelHarness);

        // assert
        expect(await expansionPanel.getTextContent()).toEqual("API KeysSSH Keys");
      });
    });
  });
});
