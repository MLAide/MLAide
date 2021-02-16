import { convertToParamMap, ParamMap, Params } from '@angular/router';
import { ReplaySubject } from 'rxjs';

/**
 * An ActivateRoute test double with a `paramMap` observable.
 * Use the `setParamMap()` method to add the next `paramMap` value.
 * See https://angular.io/guide/testing-components-scenarios#activatedroutestub
 * for details.
 */
export class ActivatedRouteStub {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `paramMap` observable
  private subject = new ReplaySubject<ParamMap>();
  private parentSubject = new ReplaySubject<ParamMap>();

  constructor(initialParams?: Params) {
    this.setParamMap(initialParams);
  }

  /** The mock params observable */
  readonly params = this.subject.asObservable();
  readonly parent = {
    params: this.parentSubject.asObservable()
  };

  /** Set the paramMap observables's next value */
  setParamMap(params?: Params) {
    this.subject.next(convertToParamMap(params));
  }

  /** Set the parent paramMap observables's next value */
  setParentParamMap(params?: Params) {
    this.parentSubject.next(convertToParamMap(params));
  }
}
