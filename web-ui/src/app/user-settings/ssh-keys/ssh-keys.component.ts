import { Component, OnInit } from '@angular/core';
import { Store } from "@ngrx/store";
import { openAddSshKeyDialog } from "@mlaide/state/ssh-key/ssh-key.actions";

@Component({
  selector: 'app-ssh-keys',
  templateUrl: './ssh-keys.component.html',
  styleUrls: ['./ssh-keys.component.scss']
})
export class SshKeysComponent implements OnInit {

  constructor(private readonly store: Store) {}

  ngOnInit(): void {

  }

  public addSshKey(): void {
    this.store.dispatch(openAddSshKeyDialog());
  }

}
