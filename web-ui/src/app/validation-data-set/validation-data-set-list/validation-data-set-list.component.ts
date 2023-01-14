import { Component, OnInit } from "@angular/core";
import { openAddValidationDataSetDialog } from "@mlaide/state/validation-data-set/validation-data-set.actions";
import { Store } from "@ngrx/store";

@Component({
  selector: 'app-validation-data-set-list',
  templateUrl: './validation-data-set-list.component.html',
  styleUrls: ['./validation-data-set-list.component.scss']
})
export class ValidationDataSetListComponent implements OnInit {

  constructor(private store: Store) {}

  ngOnInit(): void {
  }


  public addValidationDataSet(): void {
    this.store.dispatch(openAddValidationDataSetDialog());
  }
}
