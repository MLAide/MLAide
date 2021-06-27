import { AfterViewInit, Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Observable, Subscription } from "rxjs";
import { Artifact } from "@mlaide/state/artifact/artifact.models";

@Component({
  selector: "app-artifacts-list-table",
  templateUrl: "./artifacts-list-table.component.html",
  styleUrls: ["./artifacts-list-table.component.scss"],
})
export class ArtifactsListTableComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() public projectKey: string;
  @Input() public artifacts$: Observable<Artifact[]>;
  @Input() public isLoading$: Observable<boolean>;

  public dataSource: MatTableDataSource<Artifact> = new MatTableDataSource<Artifact>();
  public displayedColumns: string[] = ["createdAt", "artifactName", "version", "runName", "runKey", "type"];
  @ViewChild(MatSort) public sort: MatSort;

  private artifactListSubscription: Subscription;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.artifacts$) {
      if (this.artifactListSubscription) {
        this.artifactListSubscription.unsubscribe();
      }

      this.artifactListSubscription = this.artifacts$.subscribe((artifacts) => {
        this.dataSource.data = artifacts;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.artifactListSubscription) {
      this.artifactListSubscription.unsubscribe();
      this.artifactListSubscription = null;
    }
  }
}
