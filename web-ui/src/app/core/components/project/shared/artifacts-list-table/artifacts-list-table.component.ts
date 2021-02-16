import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { ListDataSource } from "../../../../services";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import {
  Artifact,
  ArtifactListResponse,
} from "src/app/core/models/artifact.model";

@Component({
  selector: "app-artifacts-list-table",
  templateUrl: "./artifacts-list-table.component.html",
  styleUrls: ["./artifacts-list-table.component.scss"],
})
export class ArtifactsListTableComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() artifactListDataSource: ListDataSource<ArtifactListResponse>;
  public dataSource: MatTableDataSource<Artifact> = new MatTableDataSource<Artifact>();
  public displayedColumns: string[] = [
    "createdAt",
    "artifactName",
    "version",
    "runName",
    "runKey",
    "type",
  ];
  @Input() projectKey: string;
  @ViewChild(MatSort) sort: MatSort;
  private artifactListSubscription: Subscription;

  constructor() {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.artifactListDataSource) {
      if (this.artifactListSubscription) {
        this.artifactListSubscription.unsubscribe();
      }

      this.artifactListSubscription = this.artifactListDataSource?.items$.subscribe(
        (artifacts) => {
          this.dataSource.data = artifacts.items;
        }
      );
    }
  }

  ngOnDestroy(): void {
    if (this.artifactListSubscription) {
      this.artifactListSubscription.unsubscribe();
      this.artifactListSubscription = null;
    }
  }

  ngOnInit(): void {}
}
