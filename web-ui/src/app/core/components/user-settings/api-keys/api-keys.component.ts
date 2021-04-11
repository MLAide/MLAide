import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { Subscription } from "rxjs";
import { ApiKey, ApiKeyListResponse } from "src/app/core/models/apiKey.model";
import { ListDataSource } from "src/app/core/services";
import { SnackbarUiService } from "src/app/core/services/snackbar-ui.service";
import { UsersApiService } from "src/app/core/services/users-api.service";
import { CreateApiKeyComponent } from "./create-api-key/create-api-key.component";

@Component({
  selector: "app-api-keys",
  templateUrl: "./api-keys.component.html",
  styleUrls: ["./api-keys.component.scss"],
})
export class ApiKeysComponent implements OnInit, OnDestroy {
  public displayedColumns: string[] = ["description", "createdAt", "expiresAt", "actions"];
  public dataSource: MatTableDataSource<ApiKey> = new MatTableDataSource<ApiKey>();
  private apiKeysListDatasource: ListDataSource<ApiKeyListResponse>;
  private apiKeysListSubscription: Subscription;

  constructor(private userService: UsersApiService, private dialog: MatDialog, private snackBarService: SnackbarUiService) {}

  ngOnDestroy(): void {
    if (this.apiKeysListSubscription) {
      this.apiKeysListSubscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.apiKeysListDatasource = this.userService.getApiKeys();
    this.apiKeysListSubscription = this.apiKeysListDatasource.items$.subscribe(
      (apiKeys) => (this.dataSource.data = apiKeys.items)
    );
  }

  public deleteApiKey(apiKey: ApiKey) {
    this.userService.deleteApiKey(apiKey).subscribe(
      () => {
        this.apiKeysListDatasource.refresh();
        this.snackBarService.showSuccesfulSnackbar("Successfully deleted API Key!");
      },
      () => this.snackBarService.showErrorSnackbar("Error while deleted API Key.")
    );
  }

  public openCreateApiKeyDialog(): void {
    const dialogRef: MatDialogRef<CreateApiKeyComponent, any> = this.dialog.open(CreateApiKeyComponent, {
      minWidth: "20%",
    });

    dialogRef.afterClosed().subscribe(() => {
      this.apiKeysListDatasource.refresh();
    });
  }
}
