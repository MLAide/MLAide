import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { skip } from "rxjs/operators";
import { TestBed } from "@angular/core/testing";
import { getRandomApiKey, getRandomApiKeys, getRandomUser } from "../mocks/fake-generator";

import { UsersApiService } from "./users-api.service";
import { ApiKey, ApiKeyListResponse } from "../entities/apiKey.model";
import { User } from "../entities/user.model";
import { Observable } from "rxjs";
import { ListDataSource } from ".";
import { APP_CONFIG } from "src/app/config/app-config.model";
import { appConfigMock } from "src/app/mocks/app-config.mock";

describe("UsersApiService", () => {
  let service: UsersApiService;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(UsersApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getCurrentUser", () => {
    it("should return user from api response", async (done) => {
      // arrange
      const fakeUser: User = await getRandomUser();

      // act
      const user$: Observable<User> = service.getCurrentUser();

      // assert
      user$.pipe(skip(1)).subscribe((response) => {
        expect(response).toEqual(fakeUser);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/users/current`);
      expect(req.request.method).toBe("GET");
      req.flush(fakeUser);
    });
  });

  describe("updateCurrentUser", () => {
    it("should call put on api request", async (done) => {
      // arrange
      const fakeUser: User = await getRandomUser();

      // act
      service.updateCurrentUser(fakeUser).subscribe(() => {
        done();
      });

      // assert
      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/users/current`);
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toBe(fakeUser);
      req.flush(null);
    });

    it("should update currentUser observable on successful update", async (done) => {
      // arrange
      const fakeUser: User = await getRandomUser();

      // act
      service.updateCurrentUser(fakeUser).subscribe();

      // assert
      service.currentUser$.pipe(skip(1)).subscribe((user) => {
        expect(user).toBe(fakeUser);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/users/current`);
      req.flush(null);
    });
  });

  describe("getApiKeys", () => {
    it("should return api key data source that emits results from api response", async (done) => {
      // arrange
      const fakeApiKeys: ApiKey[] = await getRandomApiKeys(2);
      const dummyResponse: ApiKeyListResponse = { items: fakeApiKeys };

      // act
      const dataSource: ListDataSource<ApiKeyListResponse> = service.getApiKeys();

      // assert
      dataSource.items$.pipe(skip(1)).subscribe((response) => {
        expect(response.items.length).toBe(fakeApiKeys.length);
        expect(response).toEqual(dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/users/current/api-keys`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyResponse);
    });
  });

  describe("createApiKey", () => {
    it("should return an api key as observable from api response", async (done) => {
      // arrange
      const fakeApiKey: ApiKey = await getRandomApiKey();

      // act
      const apiKey$: Observable<ApiKey> = service.createApiKey(fakeApiKey);

      // assert
      apiKey$.subscribe((response) => {
        expect(response).toEqual(fakeApiKey);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/users/current/api-keys`);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual(fakeApiKey);
      req.flush(fakeApiKey);
    });
  });

  describe("deleteApiKey", () => {
    it("should send a delete request with the api key id", async (done) => {
      // arrange
      const fakeApiKey: ApiKey = await getRandomApiKey();

      // act
      service.deleteApiKey(fakeApiKey).subscribe(() => {
        done();
      });

      // assert
      const req: TestRequest = httpMock.expectOne(`${service.API_URL}/api/v1/users/current/api-keys/${fakeApiKey.id}`);
      expect(req.request.method).toBe("DELETE");
      req.flush(null);
    });
  });
});
