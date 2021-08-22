import { HttpClientTestingModule, HttpTestingController, TestRequest } from "@angular/common/http/testing";
import { appConfigMock } from "@mlaide/mocks/app-config.mock";
import { TestBed } from "@angular/core/testing";
import { APP_CONFIG } from "@mlaide/config/app-config.model";
import { ApiKeyListResponse, UserApi } from "@mlaide/state/user/user.api";
import { getRandomApiKey, getRandomApiKeys, getRandomUser } from "@mlaide/mocks/fake-generator";
import { Observable } from "rxjs";
import { User } from "@mlaide/state/user/user.models";
import { ApiKey } from "@mlaide/state/api-key/api-key.models";

describe("UserApi", () => {
  let userApi: UserApi;
  let httpMock: HttpTestingController;
  let mockConfig = appConfigMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_CONFIG, useValue: mockConfig }],
      imports: [HttpClientTestingModule],
    });

    userApi = TestBed.inject<UserApi>(UserApi);
    httpMock = TestBed.inject<HttpTestingController>(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(userApi).toBeTruthy();
  });

  describe("getCurrentUser", () => {
    it("should return user from api response", async (done) => {
      // arrange
      const fakeUser: User = await getRandomUser();

      // act
      const user$: Observable<User> = userApi.getCurrentUser();

      // assert
      user$.subscribe((response) => {
        expect(response).toEqual(fakeUser);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/users/current`);
      expect(req.request.method).toBe("GET");
      req.flush(fakeUser);
    });
  });

  describe("updateCurrentUser", () => {
    it("should return updated user from api response", async (done) => {
      // arrange
      const fakeUser: User = await getRandomUser();

      // act
      const user$: Observable<User> = userApi.updateCurrentUser(fakeUser);

      // assert
      user$.subscribe((user) => {
        expect(user).toBe(fakeUser);
        done();
      });
      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/users/current`);
      expect(req.request.method).toBe("PUT");
      expect(req.request.body).toBe(fakeUser);
      req.flush(fakeUser);
    });
  });

  describe("getApiKeys", () => {
    it("should return api key data source that emits results from api response", async (done) => {
      // arrange
      const fakeApiKeys: ApiKey[] = await getRandomApiKeys(2);
      const dummyResponse: ApiKeyListResponse = { items: fakeApiKeys };

      // act
      const apiKeys$: Observable<ApiKeyListResponse> = userApi.getApiKeys();

      // assert
      apiKeys$.subscribe((response) => {
        expect(response.items.length).toBe(fakeApiKeys.length);
        expect(response).toEqual(dummyResponse);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/users/current/api-keys`);
      expect(req.request.method).toBe("GET");
      req.flush(dummyResponse);
    });
  });

  describe("createApiKey", () => {
    it("should return an api key as observable from api response", async (done) => {
      // arrange
      const fakeApiKey: ApiKey = await getRandomApiKey();

      // act
      const apiKey$: Observable<ApiKey> = userApi.createApiKey(fakeApiKey);

      // assert
      apiKey$.subscribe((response) => {
        expect(response).toEqual(fakeApiKey);
        done();
      });

      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/users/current/api-keys`);
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
      const apiCall$ = userApi.deleteApiKey(fakeApiKey);


      // assert
      apiCall$.subscribe(() => {
        done();
      });
      const req: TestRequest = httpMock.expectOne(`${appConfigMock.apiServer.uri}/api/${appConfigMock.apiServer.version}/users/current/api-keys/${fakeApiKey.id}`);
      expect(req.request.method).toBe("DELETE");
      req.flush(null);
    });
  });
});
