import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { SshKey } from "@mlaide/state/ssh-key/ssh-key.models";
import { Store } from "@ngrx/store";
import { selectNewCreatedSshKey } from "@mlaide/state/ssh-key/ssh-key.selectors";
import { addSshKey, closeAddSshKeyDialog } from "@mlaide/state/ssh-key/ssh-key.actions";
import { showSuccessMessage } from "@mlaide/state/shared/shared.actions";
import { ENTER } from "@angular/cdk/keycodes";

@Component({
  selector: 'app-add-ssh-key',
  templateUrl: './add-ssh-key.component.html',
  styleUrls: ['./add-ssh-key.component.scss']
})
export class AddSshKeyComponent implements OnInit {
  public form: FormGroup;
  public today = new Date(Date.now());
  public sshKey$: Observable<SshKey>;

  private isSshKeyCreated: boolean = false;

  constructor (private readonly formBuilder: FormBuilder,
               private readonly store: Store) {
    this.form = this.formBuilder.group({
      description: [
        "",
        {
          validators: [Validators.required],
          updateOn: "change",
        },
      ],
    });
  }

  ngOnInit(): void {
    this.sshKey$ = this.store.select(selectNewCreatedSshKey);
  }

  public close() {
    this.store.dispatch(closeAddSshKeyDialog());
  }

  public copy() {
    this.store.dispatch(showSuccessMessage({message: "Successfully copied to clipboard!"}));
  }

  public create() {
    const sshKey: SshKey = {
      publicKey: undefined,
      createdAt: undefined,
      description: this.form.value.description,
      id: undefined,
    };

    this.store.dispatch(addSshKey({ sshKey }));
    this.isSshKeyCreated = true;
  }

  public keyDown(event) {
    if (event.keyCode === ENTER) {
      if (this.form.valid && !this.isSshKeyCreated) {
        this.create();
      } else if (this.form.valid && this.isSshKeyCreated) {
        this.close();
      } else {
        Object.keys(this.form.controls).forEach((field) => {
          const control = this.form.get(field);
          control.markAsTouched({ onlySelf: true });
        });
      }
    }
  }
}
