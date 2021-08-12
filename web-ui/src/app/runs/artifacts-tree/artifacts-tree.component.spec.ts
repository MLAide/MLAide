import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { CdkTreeModule } from "@angular/cdk/tree";
import { SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { of } from "rxjs";
import { Artifact } from "@mlaide/entities/artifact.model";
import { Project } from "@mlaide/entities/project.model";
import { getRandomArtifacts, getRandomProject } from "src/app/mocks/fake-generator";

import { ArtifactsTreeComponent, FileNode, FlatTreeNode } from "./artifacts-tree.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { Action } from "@ngrx/store";
import { Subscription } from "rxjs/internal/Subscription";
import { downloadArtifact } from "@mlaide/state/artifact/artifact.actions";


describe("ArtifactsTreeComponent", () => {
  let component: ArtifactsTreeComponent;
  let fixture: ComponentFixture<ArtifactsTreeComponent>;

  // fakes
  let fakeArtifacts: Artifact[];
  let fakeProject: Project;

  // mocks
  let store: MockStore;
  let dispatchSpy: jasmine.Spy<(action: Action) => void>;

  beforeEach(async () => {
    // setup fakes
    fakeArtifacts = await getRandomArtifacts(3);
    fakeProject = await getRandomProject();

    TestBed.configureTestingModule({
      declarations: [ArtifactsTreeComponent],
      providers: [
        provideMockStore(),
      ],
      imports: [BrowserAnimationsModule, CdkTreeModule, MatButtonModule, MatCardModule, MatIconModule, MatTreeModule],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtifactsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // setup mocks
    component.projectKey = fakeProject.key;
  });

  it("should compile", () => {
    expect(component).toBeTruthy();
  });

  describe("constructor", () => {
    it("should initialize component's tree variables", () => {
      expect(component.treeFlattener).toBeTruthy();
      expect(component.treeControl).toBeTruthy();
      expect(component.dataSource).toBeTruthy();
    });
  });


  describe("ngOnChanges", () => {
    it("should call unsubscribe if artifacts$ changes detected", async () => {
      // arrange in beforeEach
      const artifacts$ = of([]);
      component.artifacts$ = artifacts$;

      const subscription = new Subscription();
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();
      spyOn(artifacts$, "subscribe").and.callFake(() => {
        return subscription;
      });

      // We need to do this twice because otherwise unsubscribe is not called
      component.ngOnChanges({
        artifacts$: new SimpleChange(null, artifacts$, true),
      });

      fixture.detectChanges();

      // act
      component.ngOnChanges({
        artifacts$: new SimpleChange(null, artifacts$, true),
      });

      fixture.detectChanges();

      // assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it("should load component's artifactNodes to data source if changes include artifact$", async () => {
      // arrange + act also in beforeEach
      const spy = spyOn(component, "ngOnChanges").and.callThrough();
      component.artifacts$ = of(fakeArtifacts);

      // act
      //directly call ngOnChanges
      component.ngOnChanges({
        artifacts$: new SimpleChange(null, of(fakeArtifacts), true),
      });
      fixture.detectChanges();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(component.dataSource.data).toEqual(component.artifactNodes);
    });

    it("should create correct artifactNodes", async () => {
      // arrange + act also in beforeEach
      assignFilesOfFakeArtifact();

      const expectedNodes: FileNode[] = [
        {
          artifactName: fakeArtifacts[0].name,
          artifactVersion: fakeArtifacts[0].version,
          isDownloadable: true,
          name: fakeArtifacts[0].name,
          type: "folder",
          children: [
            {
              isDownloadable: false,
              name: "subFolder",
              type: "folder",
              children: [
                {
                  isDownloadable: false,
                  name: "subSubFolder",
                  type: "folder",
                  children: [
                    {
                      artifactFileId: "5",
                      artifactName: fakeArtifacts[0].name,
                      artifactVersion: fakeArtifacts[0].version,
                      isDownloadable: true,
                      name: "file5",
                      type: "file",
                    },
                  ],
                },
                {
                  artifactFileId: "2",
                  artifactName: fakeArtifacts[0].name,
                  artifactVersion: fakeArtifacts[0].version,
                  isDownloadable: true,
                  name: "file2",
                  type: "file",
                },
                {
                  artifactFileId: "3",
                  artifactName: fakeArtifacts[0].name,
                  artifactVersion: fakeArtifacts[0].version,
                  isDownloadable: true,
                  name: "file3",
                  type: "file",
                },
              ],
            },
            {
              isDownloadable: false,
              name: "subFolder2",
              type: "folder",
              children: [
                {
                  artifactFileId: "4",
                  artifactName: fakeArtifacts[0].name,
                  artifactVersion: fakeArtifacts[0].version,
                  isDownloadable: true,
                  name: "file4",
                  type: "file",
                },
              ],
            },
            {
              artifactFileId: "1",
              artifactName: fakeArtifacts[0].name,
              artifactVersion: fakeArtifacts[0].version,
              isDownloadable: true,
              name: "file1",
              type: "file",
            },
          ],
        },
        {
          artifactName: fakeArtifacts[1].name,
          artifactVersion: fakeArtifacts[1].version,
          isDownloadable: true,
          name: fakeArtifacts[1].name,
          type: "folder",
          children: [
            {
              artifactFileId: "1",
              artifactName: fakeArtifacts[1].name,
              artifactVersion: fakeArtifacts[1].version,
              isDownloadable: true,
              name: "file1",
              type: "file",
            },
          ],
        },
        {
          artifactName: fakeArtifacts[2].name,
          artifactVersion: fakeArtifacts[2].version,
          isDownloadable: true,
          name: fakeArtifacts[2].name,
          type: "folder",
          children: [],
        },
      ];

      component.artifacts$ = of(fakeArtifacts);

      // act
      // directly call ngOnChanges
      component.ngOnChanges({
        artifacts$: new SimpleChange(null, of(fakeArtifacts), true),
      });
      fixture.detectChanges();

      // assert
      expect(component.artifactNodes).toEqual(expectedNodes);
      expect(component.dataSource.data).toEqual(expectedNodes);
    });

    it("should not load new data from data source if changes do not include artifacts$", async () => {
      // arrange + act also in beforeEach
      const spy = spyOn(component, "ngOnChanges").and.callThrough();
      component.artifacts$ = of(fakeArtifacts);

      // act
      //directly call ngOnChanges
      component.ngOnChanges({
        projectKey: new SimpleChange(null, of(fakeArtifacts), true),
      });
      fixture.detectChanges();

      // assert
      expect(spy).toHaveBeenCalled();
      expect(component.dataSource.data.length).toEqual(0);
    });
  });

  describe("ngOnDestroy", () => {
    it("should unsubscribe from artifactsSubscription", async () => {
      // arrange in beforeEach
      const artifacts$ = of([]);
      component.artifacts$ = artifacts$;

      const subscription = new Subscription();
      const unsubscribeSpy = spyOn(subscription, "unsubscribe").and.callThrough();
      spyOn(artifacts$, "subscribe").and.callFake(() => {
        return subscription;
      });
      component.ngOnChanges({
        artifacts$: new SimpleChange(null, artifacts$, true),
      });

      fixture.detectChanges();

      // act
      component.ngOnDestroy();

      // assert
      expect(unsubscribeSpy).toHaveBeenCalled();
    });
  });

  describe("download", () => {
    it("should dispatch downloadArtifact action with provided node", async () => {
      // arrange in beforeEach
      const node: FlatTreeNode = {
        artifactName: fakeArtifacts[0].name,
        artifactVersion: fakeArtifacts[0].version,
        artifactFileId: fakeArtifacts[0].files[0].fileId,
        name: fakeArtifacts[0].name,
        downloadable: true,
        type: "file",
        level: 1,
        expandable: false,
      };

      // act
      component.download(node);

      // assert
      expect(dispatchSpy).toHaveBeenCalledWith(downloadArtifact({
        projectKey: component.projectKey,
        artifactName: node.artifactName,
        artifactVersion: node.artifactVersion,
        artifactFileId: node.artifactFileId
      }));
    });
    /*
    // TODO Raman: Sollten diese Tests nicht auch in artifact.effects.spec.ts unter download rein?
    it("should call download with fileId if it is set", async () => {
      // arrange + act also in beforeEach
      // setup artifacts api
      const node: FlatTreeNode = {
        artifactName: fakeArtifacts[0].name,
        artifactVersion: fakeArtifacts[0].version,
        artifactFileId: fakeArtifacts[0].files[0].fileId,
        name: fakeArtifacts[0].name,
        downloadable: true,
        type: "file",
        level: 1,
        expandable: false,
      };
      artifactsApiServiceStub.download.and.returnValue(of());

      // act
      //directly call ngOnChanges
      component.download(node);

      // assert
      expect(artifactsApiServiceStub.download).toHaveBeenCalledWith(
        fakeProject.key,
        node.artifactName,
        node.artifactVersion,
        node.artifactFileId
      );
    });

    it("should call download without fileId if it is not set", async () => {
      // arrange + act also in beforeEach
      // setup artifacts api
      const node: FlatTreeNode = {
        artifactName: fakeArtifacts[0].name,
        artifactVersion: fakeArtifacts[0].version,
        name: fakeArtifacts[0].name,
        downloadable: true,
        type: "file",
        level: 1,
        expandable: false,
      };
      artifactsApiServiceStub.download.and.returnValue(of());

      // act
      //directly call ngOnChanges
      component.download(node);

      // assert
      expect(artifactsApiServiceStub.download).toHaveBeenCalledWith(fakeProject.key, node.artifactName, node.artifactVersion);
    });

    it("should call FileSaver saveAs with correct blob, filename and content disposition", async (done) => {
      // arrange + act also in beforeEach
      // setup artifacts api
      const node: FlatTreeNode = {
        artifactName: fakeArtifacts[0].name,
        artifactVersion: fakeArtifacts[0].version,
        name: fakeArtifacts[0].name,
        downloadable: true,
        type: "file",
        level: 1,
        expandable: false,
      };

      const headers: HttpHeaders = new HttpHeaders({
        "Content-Disposition": 'attachment; filename="data.csv"',
        "Content-Type": "text/csv",
      });
      const returnBuffer: ArrayBufferLike = new Uint16Array([1, 2, 3]).buffer;
      const response = new HttpResponse<ArrayBuffer>({
        body: returnBuffer,
        headers: headers,
      });
      artifactsApiServiceStub.download.and.returnValue(of(response));

      // act
      component.download(node);

      // assert
      expect(fileSaverServiceStub.save).toHaveBeenCalledWith(jasmine.any(Blob), "data.csv");
      const actualBlob = fileSaverServiceStub.save.calls.argsFor(0)[0];
      expect(actualBlob.type).toBe("text/csv");
      actualBlob.arrayBuffer().then((buffer) => {
        expect(buffer).toEqual(returnBuffer);
        done();
      });
    });
    */
  });


  describe("hasChild", () => {
    it("should return true if node has child", () => {
      // arrange
      const node: FlatTreeNode = {
        artifactName: fakeArtifacts[0].name,
        artifactVersion: fakeArtifacts[0].version,
        name: fakeArtifacts[0].name,
        downloadable: true,
        type: "file",
        level: 1,
        expandable: true,
      };

      // act + assert
      expect(component.hasChild(node)).toBeTruthy();
    });

    it("should return false if node has child", () => {
      // arrange
      const node: FlatTreeNode = {
        artifactName: fakeArtifacts[0].name,
        artifactVersion: fakeArtifacts[0].version,
        name: fakeArtifacts[0].name,
        downloadable: true,
        type: "file",
        level: 1,
        expandable: false,
      };

      // act + assert
      expect(component.hasChild(node)).toBeFalsy();
    });
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;
    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);

      assignFilesOfFakeArtifact();

      component.artifacts$ = of(fakeArtifacts);

      component.ngOnChanges({
        artifacts$: new SimpleChange(null, of(fakeArtifacts), true),
      });
      fixture.detectChanges();
    });


    it("should contain the artifacts tree", () => {
      // arrange + act also in beforeEach
      let tree: HTMLElement = fixture.nativeElement.querySelector("mat-tree");

      // assert
      expect(tree).toBeTruthy();
    });

    it("should contain the artifacts tree nodes", async () => {
      // arrange + act also in beforeEach
      // expand whole tree
      let buttons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness);

      await buttons[0].click(); // 1st-artifact
      await buttons[2].click(); // 2nd-artifact

      buttons = await loader.getAllHarnesses(MatButtonHarness);
      await buttons[2].click(); // subFolder
      await buttons[3].click(); // subFolder2

      buttons = await loader.getAllHarnesses(MatButtonHarness);
      await buttons[3].click(); // subSubFolder

      let treeNodes: HTMLElement[] = fixture.nativeElement.querySelectorAll("mat-tree-node");

      // assert
      expect(treeNodes.length).toEqual(12);
      expect(treeNodes[0].textContent.trim()).toEqual("folder  1st-Artifact cloud_download");
      expect(treeNodes[1].textContent.trim()).toEqual("folder  subFolder");
      expect(treeNodes[2].textContent.trim()).toEqual("folder  subSubFolder");
      expect(treeNodes[3].textContent.trim()).toEqual("description  file5 cloud_download");
      expect(treeNodes[4].textContent.trim()).toEqual("description  file2 cloud_download");
      expect(treeNodes[5].textContent.trim()).toEqual("description  file3 cloud_download");
      expect(treeNodes[6].textContent.trim()).toEqual("folder  subFolder2");
      expect(treeNodes[7].textContent.trim()).toEqual("description  file4 cloud_download");
      expect(treeNodes[8].textContent.trim()).toEqual("description  file1 cloud_download");
      expect(treeNodes[9].textContent.trim()).toEqual("folder  2nd-Artifact cloud_download");
      expect(treeNodes[10].textContent.trim()).toEqual("description  file1 cloud_download");
      expect(treeNodes[11].textContent.trim()).toEqual("folder  3rd-Artifact cloud_download");
    });

    it("should call download without fileId when clicking on root folder", async () => {
      // arrange + act also in beforeEach
      let buttons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness.with({ text: "cloud_download" }));
      const spy = spyOn(component, "download");
      const node: FlatTreeNode = {
        artifactFileId: undefined,
        artifactName: fakeArtifacts[0].name,
        artifactVersion: fakeArtifacts[0].version,
        name: fakeArtifacts[0].name,
        downloadable: true,
        type: "folder",
        level: 0,
        expandable: true,
      };

      // act
      await buttons[0].click();

      // assert
      expect(spy).toHaveBeenCalledWith(node);
    });

    it("should call download with fileId when clicking on file", async () => {
      // arrange + act also in beforeEach
      let buttons: MatButtonHarness[] = await loader.getAllHarnesses(MatButtonHarness);
      const spy = spyOn(component, "download");
      const node: FlatTreeNode = {
        artifactFileId: "1",
        artifactName: fakeArtifacts[0].name,
        artifactVersion: fakeArtifacts[0].version,
        name: "file1",
        downloadable: true,
        type: "file",
        level: 1,
        expandable: false,
      };

      // act
      await buttons[0].click(); // 1st-Artifact

      buttons = await loader.getAllHarnesses(MatButtonHarness);

      await buttons[5].click(); // cloud_download file1

      // assert
      expect(spy).toHaveBeenCalledWith(node);
    });
  });

  function assignFilesOfFakeArtifact() {
    /*
     * Creates this structure:
     * 1st-Artifact
     *   |- subfolder
     *   | |- subSubFolder
     *   | | |- file5
     *   | |- file2
     *   | |- file3
     *   |- subfolder2
     *   | |- file4
     *   |- file1
     * 2nd-Artifact
     *   |- file1
     * 3rd-Artifact
     */

    fakeArtifacts[0].name = "1st-Artifact";
    fakeArtifacts[0].files = [
      {
        fileId: "1",
        fileName: "file1", // 1st-Artifact/file1
      },
      {
        fileId: "2",
        fileName: "subFolder/file2", // 1st-Artifact/subFolder/file2
      },
      {
        fileId: "3",
        fileName: "subFolder/file3", // 1st-Artifact/subFolder/file3
      },
      {
        fileId: "4",
        fileName: "subFolder2/file4", // 1st-Artifact/subFolder2/file4
      },
      {
        fileId: "5",
        fileName: "subFolder/subSubFolder/file5", // 1st-Artifact/subFolder/subSubFolder/file5
      },
    ];

    fakeArtifacts[1].name = "2nd-Artifact";
    fakeArtifacts[1].files = [
      {
        fileId: "1",
        fileName: "file1", // 2nd-Artifact/file1
      },
    ];

    fakeArtifacts[2].name = "3rd-Artifact";
    fakeArtifacts[2].files = [];
  }
});
