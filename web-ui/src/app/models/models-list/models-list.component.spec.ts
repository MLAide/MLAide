import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { getRandomArtifacts } from "@mlaide/mocks/fake-generator";
import { ModelStageI18nComponent } from "@mlaide/shared/components/model-stage-i18n/model-stage-i18n.component";
import { ModelsListComponent } from "./models-list.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { selectIsLoadingArtifacts, selectModels } from "@mlaide/state/artifact/artifact.selectors";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ModelListTableComponent } from "@mlaide/shared/components/model-list-table/model-list-table.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("ModelsListComponent", () => {
  let component: ModelsListComponent;
  let fixture: ComponentFixture<ModelsListComponent>;

  // fakes
  let fakeArtifacts: Artifact[];

  // mocks
  let store: MockStore;

  beforeEach(async () => {
    // arrange fakes
    fakeArtifacts = await getRandomArtifacts(3);

    await TestBed.configureTestingModule({
      declarations: [ModelsListComponent, ModelListTableComponent, ModelStageI18nComponent],
      providers: [provideMockStore()],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        MatTooltipModule,
        MatSortModule,
        MatProgressSpinnerModule,
        RouterTestingModule,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    store.overrideSelector(selectModels, fakeArtifacts);
    store.overrideSelector(selectIsLoadingArtifacts, true);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnInit", () => {
    it("should select models from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.models$.subscribe((models) => {
        expect(models).toBe(fakeArtifacts);
        done();
      });
    });

    it("should select isLoadingArtifacts$ from store correctly", async (done) => {
      // arrange + act in beforeEach

      // assert
      component.isLoadingArtifacts$.subscribe((isLoading) => {
        expect(isLoading).toBe(true);
        done();
      });
    });
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;

    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it("should contain components title", async () => {
      // arrange + act also in beforeEach
      let h1: HTMLElement = fixture.nativeElement.querySelector("h1");

      // assert
      expect(h1.textContent).toEqual("Models");
    });
  });
});
