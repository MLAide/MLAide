import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthGuard } from './auth-guard.service';
import { AuthService } from './auth.service';

describe('AuthGuardService', () => {
  let authGuard: AuthGuard;

  let routerStub: jasmine.SpyObj<Router>;
  let authServiceStub: Partial<AuthService>;
  let authServiceCanActivateProtectedRoutes$;

  beforeEach(() => {
    routerStub = jasmine.createSpyObj('router', ['parseUrl']);

    authServiceCanActivateProtectedRoutes$ = new Subject<boolean>();
    authServiceStub = {
      canActivateProtectedRoutes$: authServiceCanActivateProtectedRoutes$
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: AuthService, useValue: authServiceStub }
      ]
    }).compileComponents();

    authGuard = TestBed.inject(AuthGuard);
  });

  describe('canActivate', () => {
    it('should return UrlTree directing to /home if user is not authenticated', (done) => {
      // arrange
      const expectedResult = new UrlTree();
      routerStub.parseUrl.withArgs('/home').and.returnValue(expectedResult);

      // act
      const canActivate = authGuard.canActivate(undefined, undefined);

      // assert
      canActivate.subscribe(result => {
        expect(result).toBe(expectedResult);
        done();
      });

      authServiceCanActivateProtectedRoutes$.next(false);
    });

    it('should return true if user is authenticated', (done) => {
      // act
      const canActivate = authGuard.canActivate(undefined, undefined);

      // assert
      canActivate.subscribe((result: boolean) => {
        expect(result).toEqual(true);
        done();
      });

      authServiceCanActivateProtectedRoutes$.next(true);
    });
  });
});
