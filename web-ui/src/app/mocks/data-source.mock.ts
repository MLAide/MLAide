import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Project, ProjectListResponse } from '../core/models/project.model';
import { ListDataSource } from '../core/services';

export class ProjectListDataSourceMock implements ListDataSource<ProjectListResponse> {
  private itemsToEmulate: Project[] = [];
  private projectsSubject$: Subject<ProjectListResponse> = new BehaviorSubject({ items: this.itemsToEmulate });
  public items$: Observable<ProjectListResponse> = this.projectsSubject$.asObservable();

  constructor() {
    this.refresh();
  }

  refresh(): void {
    const response: ProjectListResponse = {
      items: this.itemsToEmulate
    };
    this.projectsSubject$.next(response);
  }

  emulate(items: Project[]) {
    this.itemsToEmulate = items;
    this.refresh();
  }
}

export class ListDataSourceMock<TEntity, TListResponse> implements ListDataSource<TListResponse> {
  private itemsToEmulate: TEntity[] = [];
  private itemsSubject$ = new BehaviorSubject({ items: this.itemsToEmulate});
  public items$: Observable<TListResponse> = (this.itemsSubject$ as any).asObservable();

  constructor() {
    this.refresh();
  }

  refresh(): void {
    const response = {
      items: this.itemsToEmulate,
      refresh: () => {}
    };
    this.itemsSubject$.next(response);
  }

  emulate(items: TEntity[]) {
    this.itemsToEmulate = items;
    this.refresh();
  }
}
