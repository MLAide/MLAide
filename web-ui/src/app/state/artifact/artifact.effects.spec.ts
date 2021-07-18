import { Observable, of } from "rxjs";
import { Action } from "@ngrx/store";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { ComponentType } from "@angular/cdk/portal";
import { MatDialogConfig } from "@angular/material/dialog/dialog-config";
import { MatDialogRef } from "@angular/material/dialog/dialog-ref";
import { TestBed } from "@angular/core/testing";
import { provideMockActions } from "@ngrx/effects/testing";
import { ArtifactEffects } from "@mlaide/state/artifact/artifact.effects";
import { ArtifactApi, ArtifactListResponse } from "@mlaide/state/artifact/artifact.api";
import { EditModelComponent } from "@mlaide/models/edit-model/edit-model.component";
import Spy = jasmine.Spy;
import { getRandomArtifacts } from "@mlaide/mocks/fake-generator";
import { loadModels, loadModelsSucceeded } from "@mlaide/state/artifact/artifact.actions";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { randomUUID } from "crypto";

describe("ArtifactEffects", () => {
  let actions$ = new Observable<Action>();
  let effects: ArtifactEffects;
  let artifactApiStub: jasmine.SpyObj<ArtifactApi>;
  let matDialog: MatDialog;
  let openDialogSpy: Spy<(component: ComponentType<EditModelComponent>, config?: MatDialogConfig) => MatDialogRef<EditModelComponent>>;
  let closeAllDialogSpy: Spy<() => void>;
  let store: MockStore;

  beforeEach(() => {
    artifactApiStub = jasmine.createSpyObj<ArtifactApi>("ArtifactApi", ["getArtifacts", "putModel"]);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        ArtifactEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          initialState: {
          }
        }),
        { provide: ArtifactApi, useValue: artifactApiStub }
      ],
    });

    effects = TestBed.inject<ArtifactEffects>(ArtifactEffects);
    matDialog = TestBed.inject<MatDialog>(MatDialog);
    openDialogSpy = spyOn(matDialog, 'open');
    closeAllDialogSpy = spyOn(matDialog, 'closeAll');
    store = TestBed.inject(MockStore);
  });

  describe("loadModels$", () => {
    it("should trigger loadModelsSucceeded action containing models if api call is successful", async (done) => {
      // arrange
      actions$ = of(loadModels());
      const models = await getRandomArtifacts(3);
      const response: ArtifactListResponse = { items: models };
      artifactApiStub.getArtifacts.and.returnValue(of(response));
      const projectKey = randomUUID();
      store.setState({
        router: {
          state: {
            root: {
              firstChild: {
                params: {
                  projectKey: projectKey
                }
              }
            }
          }
        }
      });

      // act
      effects.loadModels$.subscribe(action => {
        // assert
        expect(action).toEqual(loadModelsSucceeded({ models }));
        expect(artifactApiStub.getArtifacts).toHaveBeenCalledWith(projectKey, true);

        done();
      });
    });
  });
});
