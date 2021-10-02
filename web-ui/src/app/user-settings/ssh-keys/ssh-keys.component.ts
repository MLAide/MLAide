import { Component, OnInit } from '@angular/core';
import { Store } from "@ngrx/store";
import { deleteSshKey, openAddSshKeyDialog } from "@mlaide/state/ssh-key/ssh-key.actions";
import { Observable } from "rxjs";
import { SshKey } from "@mlaide/state/ssh-key/ssh-key.models";
import { selectSshKeys, selectIsLoadingSshKeys } from "@mlaide/state/ssh-key/ssh-key.selectors";
import { loadSshKeys } from "@mlaide/state/ssh-key/ssh-key.actions";
import { showSuccessMessage } from "@mlaide/state/shared/shared.actions";

@Component({
  selector: 'app-ssh-keys',
  templateUrl: './ssh-keys.component.html',
  styleUrls: ['./ssh-keys.component.scss']
})
export class SshKeysComponent implements OnInit {
  public displayedColumns: string[] = ["description", "sshKey", "createdAt", "expiresAt", "actions"];

  public sshKeys$: Observable<SshKey[]>;
  public isLoading$: Observable<boolean>;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.sshKeys$ = this.store.select(selectSshKeys);
    this.isLoading$ = this.store.select(selectIsLoadingSshKeys);

    this.store.dispatch(loadSshKeys());
  }

  public addSshKey(): void {
    this.store.dispatch(openAddSshKeyDialog());
  }

  public copy() {
    this.store.dispatch(showSuccessMessage({message: "Successfully copied to clipboard!"}));
  }

  public deleteSshKey(sshKey: SshKey) {
    this.store.dispatch(deleteSshKey({ sshKey }));
  }
}
