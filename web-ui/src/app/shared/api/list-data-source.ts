import { Observable } from "rxjs";

export interface ListDataSource<TResponse> {
  items$: Observable<TResponse>;
  refresh(): void;
}
