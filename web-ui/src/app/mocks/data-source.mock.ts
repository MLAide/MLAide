import { ListDataSource } from "@mlaide/shared/api";
import { BehaviorSubject, Observable } from "rxjs";

export class ListDataSourceMock<TEntity, TListResponse> implements ListDataSource<TListResponse> {
  private itemsToEmulate: TEntity[] = [];
  private itemsSubject$ = new BehaviorSubject({ items: this.itemsToEmulate });
  public items$: Observable<TListResponse> = (this.itemsSubject$ as any).asObservable();

  constructor() {
    this.refresh();
  }

  refresh(): void {
    const response = {
      items: this.itemsToEmulate,
      refresh: () => {
        // This is intentional
      },
    };
    this.itemsSubject$.next(response);
  }

  emulate(items: TEntity[]) {
    this.itemsToEmulate = items;
    this.refresh();
  }
}
