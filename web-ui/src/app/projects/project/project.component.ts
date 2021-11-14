import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { selectCurrentProject } from "@mlaide/state/project/project.selectors";
import { Store } from "@ngrx/store";
import { Project } from "@mlaide/state/project/project.models";

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.scss"],
})
export class ProjectComponent implements OnInit {
  public project$: Observable<Project>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.project$ = this.store.select(selectCurrentProject);
  }
}
