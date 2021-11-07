import { Component, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs";
import { selectCurrentProject } from "@mlaide/state/project/project.selectors";
import { Store } from "@ngrx/store";
import { loadProject } from "@mlaide/state/project/project.actions";
import { Project } from "@mlaide/state/project/project.models";

@Component({
  selector: "app-project",
  templateUrl: "./project.component.html",
  styleUrls: ["./project.component.scss"],
})
export class ProjectComponent implements OnInit, OnChanges {
  public project$: Observable<Project>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.project$ = this.store.select(selectCurrentProject);

    this.store.dispatch(loadProject());
  }

  ngOnChanges(changes: SimpleChanges): void {
    alert("changes");
  }
}
