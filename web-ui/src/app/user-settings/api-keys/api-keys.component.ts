import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { selectApiKeys, selectIsLoadingApiKeys } from "@mlaide/state/api-key/api-key.selectors";
import { ApiKey } from "@mlaide/state/api-key/api-key.models";
import { deleteApiKey, loadApiKeys, openAddApiKeyDialog } from "@mlaide/state/api-key/api-key.actions";

@Component({
  selector: "app-api-keys",
  templateUrl: "./api-keys.component.html",
  styleUrls: ["./api-keys.component.scss"],
})
export class ApiKeysComponent implements OnInit {
  public displayedColumns: string[] = ["description", "createdAt", "expiresAt", "actions"];

  public apiKeys$: Observable<ApiKey[]>;
  public isLoading$: Observable<boolean>;

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.apiKeys$ = this.store.select(selectApiKeys);
    this.isLoading$ = this.store.select(selectIsLoadingApiKeys);

    this.store.dispatch(loadApiKeys());
  }

  public addApiKey(): void {
    this.store.dispatch(openAddApiKeyDialog());
  }

  public deleteApiKey(apiKey: ApiKey) {
    this.store.dispatch(deleteApiKey({ apiKey }));
  }
}
