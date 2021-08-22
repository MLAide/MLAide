import { Component, Input } from "@angular/core";
import { ProjectMemberRole } from "@mlaide/state/project-member/project-member.models";

@Component({
  selector: "app-project-member-role-i18n",
  templateUrl: "./project-member-role-i18n.component.html",
  styleUrls: ["./project-member-role-i18n.component.scss"],
})
export class ProjectMemberRoleI18nComponent {
  @Input()
  key: ProjectMemberRole;
}
