import { Component, Input, OnInit } from '@angular/core';
import { ProjectMemberRole } from '../../../../models/projectMember.model';

@Component({
  selector: 'app-project-member-role-i18n',
  templateUrl: './project-member-role-i18n.component.html',
  styleUrls: ['./project-member-role-i18n.component.scss']
})
export class ProjectMemberRoleI18nComponent implements OnInit {
  @Input()
  key: ProjectMemberRole;

  constructor() { }

  ngOnInit(): void {
  }

}
