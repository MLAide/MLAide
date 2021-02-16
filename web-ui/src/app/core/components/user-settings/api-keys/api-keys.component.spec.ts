import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from '@angular/material/table/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockPipe } from 'ng-mocks';
import { EMPTY, of, Subject } from 'rxjs';
import { ApiKey, ApiKeyListResponse } from 'src/app/core/models/apiKey.model';
import { SnackbarUiService, UsersApiService } from 'src/app/core/services';
import { ListDataSourceMock } from 'src/app/mocks/data-source.mock';
import { getRandomApiKeys } from 'src/app/mocks/fake-generator';

import { ApiKeysComponent } from './api-keys.component';

describe('ApiKeysComponent', () => {
  let component: ApiKeysComponent;
  let fixture: ComponentFixture<ApiKeysComponent>;
  let loader: HarnessLoader;

  // fakeVariables
  let fakeApiKeys: ApiKey[];

  // service stubs
  let usersApiServiceStub: jasmine.SpyObj<UsersApiService>;
  let snackBarUiServiceStub: jasmine.SpyObj<SnackbarUiService>;

  // data source mocks
  let apiKeyListDataSourceMock: ListDataSourceMock<ApiKey, ApiKeyListResponse> = new ListDataSourceMock();

  beforeEach(async () => {
    // stub services - but do not setup every stub behaviour; this will be done partly in the test itself
    usersApiServiceStub = jasmine.createSpyObj('usersApiService', ['getApiKeys', 'deleteApiKey']);
    snackBarUiServiceStub = jasmine.createSpyObj('snackBarUiService', ['showSuccesfulSnackbar', 'showErrorSnackbar']);

    // arrange fakes & stubs
    // setup users fakes
    fakeApiKeys = await getRandomApiKeys();

    // setup users api
    usersApiServiceStub.getApiKeys.and.returnValue(apiKeyListDataSourceMock);
    apiKeyListDataSourceMock.emulate(fakeApiKeys);

    await TestBed.configureTestingModule({
      declarations: [
        ApiKeysComponent,
        MockPipe(DatePipe, v => v),
      ],
      providers: [
        { provide: SnackbarUiService, useValue: snackBarUiServiceStub },
        { provide: UsersApiService, useValue: usersApiServiceStub },
      ],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
      ],
    })
      .compileComponents();
  });

  afterEach(() => {
    apiKeyListDataSourceMock.emulate([])
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiKeysComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set datasource to loaded api keys', async () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.data).toBe(fakeApiKeys);
    });
  });

  describe('component rendering', () => {
    it('should contain components title', async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector('h1');

      // assert
      expect(h1.textContent).toEqual('API Keys');
    });

    it('should contain components subtext', async () => {
      // arrange + act also in beforeEach
      let subText: HTMLElement = fixture.nativeElement.querySelector('#sub-text');

      // assert
      expect(subText.textContent).toContain('Manage your API Keys');
    });

    describe('add api key', () => {
      const addApiKeyButtonTitle = 'Add API Key';
      it('should contain add api key button', () => {
        // arrange + act also in beforeEach
        let addApiKeyButton: HTMLElement = fixture.nativeElement.querySelector('button');

        // assert
        expect(addApiKeyButton).toBeTruthy();
        expect(addApiKeyButton.textContent).toContain(addApiKeyButtonTitle);
      });

      it('should call openCreateProjectDialog on clicking the add api key button', async () => {
        // arrange + act also in beforeEach
        spyOn(component, 'openCreateApiKeyDialog');
        const addApiKeyButton = await loader.getHarness(MatButtonHarness.with({ text: addApiKeyButtonTitle }));

        // act
        await addApiKeyButton.click();
        // assert
        fixture.whenStable().then(() => {
          expect(component.openCreateApiKeyDialog).toHaveBeenCalled();
        });
      });
    });

    describe('api keys table', () => {
      it('should contain the api keys table', () => {
        // arrange + act also in beforeEach
        let apiKeysTable: HTMLElement = fixture.nativeElement.querySelector('table');

        // assert
        expect(apiKeysTable.textContent).toBeTruthy();
      });

      it('should have defined headers', async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
        const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

        // assert
        expect(Object.keys(headerRow).length).toBe(4);
        expect(headerRow.description).toBe('Description');
        expect(headerRow.createdAt).toBe('Created at');
        expect(headerRow.expiresAt).toBe('Expires at');
        expect(headerRow.actions).toBe('Actions');
      });

      it('should show row for each api key', async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: 'delete' }));

        // assert
        expect(rows.length).toBe(fakeApiKeys.length);
        expect(deleteButtons.length).toBe(fakeApiKeys.length);
        fakeApiKeys.forEach(async (fakeApiKey, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();
          expect(row.description).toEqual(fakeApiKey.description);
          expect(row.createdAt).toEqual(String(fakeApiKey.createdAt));
          expect(row.expiresAt).toEqual(String(fakeApiKey.expiresAt));
          expect(row.actions).toBe('delete');
        });
      });

      it('should show "-" in expires at cell if it is undefined', async () => {
        // arrange + act also in beforeEach
        fakeApiKeys[0].expiresAt = undefined;
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const firstRow: MatRowHarnessColumnsText = await rows[0].getCellTextByColumnName();

        // assert
        expect(firstRow.expiresAt).toEqual('-');
      });

      it('should show "-" in expires at cell if it is null', async () => {
        // arrange + act also in beforeEach
        fakeApiKeys[0].expiresAt = null;
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const firstRow: MatRowHarnessColumnsText = await rows[0].getCellTextByColumnName();

        // assert
        expect(firstRow.expiresAt).toEqual('-');
      });

      it('should call deleteApiKey on clicking delete button in row', async () => {
        // arrange + act also in beforeEach
        usersApiServiceStub.deleteApiKey.withArgs(fakeApiKeys[fakeApiKeys.length - 1]).and.returnValue(of());
        const deleteButtons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: 'delete' }));

        // act
        await deleteButtons[deleteButtons.length - 1].click();

        // assert
        fixture.whenStable().then(() => {
          expect(usersApiServiceStub.deleteApiKey).toHaveBeenCalledWith(fakeApiKeys[fakeApiKeys.length - 1]);
        });
      });
    });

    describe('deleteApiKey', () => {
      it('should call deleteApiKey with provided api key', async () => {
        // arrange + act in beforeEach
        usersApiServiceStub.deleteApiKey.withArgs(fakeApiKeys[0]).and.returnValue(EMPTY);

        // act
        component.deleteApiKey(fakeApiKeys[0]);

        // assert
        expect(usersApiServiceStub.deleteApiKey).toHaveBeenCalledWith(fakeApiKeys[0]);
      });

      it('should display snackbar with success message if api key was deleted', async () => {
        // arrange + act in beforeEach
        const subject = new Subject<void>();
        usersApiServiceStub.deleteApiKey.and.returnValue(subject.asObservable());

        // act
        component.deleteApiKey(fakeApiKeys[0]);
        subject.next();

        // assert
        expect(snackBarUiServiceStub.showSuccesfulSnackbar).toHaveBeenCalledWith("Successfully deleted API Key!");
      });

      it('should display snackbar with error message if api key could not be deleted', async () => {
        // arrange + act in beforeEach
        const subject = new Subject<void>();
        usersApiServiceStub.deleteApiKey.and.returnValue(subject.asObservable());

        // act
        component.deleteApiKey(fakeApiKeys[0]);
        subject.error('This is a test error thrown in api-keys.component.spec.ts');

        // assert
        expect(snackBarUiServiceStub.showErrorSnackbar).toHaveBeenCalledWith("Error while deleted API Key.");
      });
    });
  });
});