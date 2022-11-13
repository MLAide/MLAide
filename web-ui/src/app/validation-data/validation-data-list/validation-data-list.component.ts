import { Component, OnInit } from "@angular/core";
import { openAddValidationDataDialog } from "@mlaide/state/validation-data/validation-data.actions";
import { Store } from "@ngrx/store";

@Component({
  selector: 'app-validation-data-list',
  templateUrl: './validation-data-list.component.html',
  styleUrls: ['./validation-data-list.component.scss']
})
export class ValidationDataListComponent implements OnInit {

  constructor(private store: Store) {}

  ngOnInit(): void {
  }


  public addValidationDataSet(): void {
    this.store.dispatch(openAddValidationDataDialog());
  }
}
