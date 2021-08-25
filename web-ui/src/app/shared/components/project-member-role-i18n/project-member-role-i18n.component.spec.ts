import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProjectMemberRoleI18nComponent } from "./project-member-role-i18n.component";
import { ProjectMemberRole } from "@mlaide/state/project-member/project-member.models";

describe("ProjectMemberRoleI18nComponent", () => {
  let component: ProjectMemberRoleI18nComponent;
  let fixture: ComponentFixture<ProjectMemberRoleI18nComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjectMemberRoleI18nComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMemberRoleI18nComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("Project Member Role", () => {
    it("should have length 3", () => {
      // arrange + act also in beforeEach

      // assert
      expect(Object.keys(ProjectMemberRole).length).toEqual(3);
    });
  });

  describe("component rendering", () => {
    it("should show Contributor when key is CONTRIBUTOR", () => {
      // arrange + act also in beforeEach
      component.key = ProjectMemberRole.CONTRIBUTOR;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Contributor");
    });

    it("should show Owner when key is OWNER", () => {
      // arrange + act also in beforeEach
      component.key = ProjectMemberRole.OWNER;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Owner");
    });

    it("should show Viewer when key is VIEWER", () => {
      // arrange + act also in beforeEach
      component.key = ProjectMemberRole.VIEWER;
      fixture.detectChanges();

      // assert
      expect(fixture.nativeElement.textContent.trim()).toEqual("Viewer");
    });
  });

  describe("check if all values have translations", () => {
    // checking if everything is translated
    // Cannot be `const enum`
    Object.values(ProjectMemberRole).forEach((key) => {
      it(`should translate ${key}`, () => {
        component.key = key;

        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).not.toBe("unknown");
      });
    });
  });
});
