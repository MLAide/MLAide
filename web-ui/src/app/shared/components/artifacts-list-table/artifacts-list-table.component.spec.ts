import { HarnessLoader, TestElement } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { DatePipe } from "@angular/common";
import { SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonHarness } from "@angular/material/button/testing";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { MockPipe } from "ng-mocks";
import { Artifact, ArtifactListResponse } from "@mlaide/entities/artifact.model";
import { Project } from "@mlaide/entities/project.model";
import { ListDataSourceMock } from "src/app/mocks/data-source.mock";
import { getRandomArtifacts, getRandomProject } from "src/app/mocks/fake-generator";

import { ArtifactsListTableComponent } from "./artifacts-list-table.component";

describe("ArtifactsListTableComponent", () => {
  let component: ArtifactsListTableComponent;
  let fixture: ComponentFixture<ArtifactsListTableComponent>;

  // fakes
  let fakeArtifacts: Artifact[];
  let fakeProject: Project;

  // data source mocks
  let artifactListDataSourceMock: ListDataSourceMock<Artifact, ArtifactListResponse> = new ListDataSourceMock();

  beforeEach(async () => {
    // setup fakes
    fakeArtifacts = await getRandomArtifacts(3);
    fakeProject = await getRandomProject();

    await TestBed.configureTestingModule({
      declarations: [ArtifactsListTableComponent, MockPipe(DatePipe, (v) => v)],
      imports: [BrowserAnimationsModule, MatButtonModule, MatTableModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtifactsListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // setup mocks
    // component.artifactListDataSource = artifactListDataSourceMock;
    component.projectKey = fakeProject.key;
  });

  afterEach(() => {
    artifactListDataSourceMock.emulate([]);
  });

  it("should create", () => {
    // arrange + act also in beforeEach

    expect(component).toBeTruthy();
  });
// TODO: Fix Tests
/*
  describe("ngAfterViewInit", () => {
    it("should set datasource sort", () => {
      // arrange + act in beforeEach

      // assert
      expect(component.dataSource.sort).toEqual(component.sort);
    });
  });

  describe("ngOnChanges", () => {
    it("should load new data from data source if changes include artifactListDataSource", async () => {
      // arrange + act also in beforeEach
      const spy = spyOn(component, "ngOnChanges").and.callThrough();
      artifactListDataSourceMock.emulate(fakeArtifacts);

      //directly call ngOnChanges
      component.ngOnChanges({
        artifactListDataSource: new SimpleChange(null, artifactListDataSourceMock, true),
      });
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      expect(component.dataSource.data.length).toEqual(3);
      expect(component.dataSource.data).toEqual(fakeArtifacts);
    });

    it("should not load new data from data source if changes do not include artifactListDataSource", async () => {
      // arrange + act also in beforeEach
      const spy = spyOn(component, "ngOnChanges").and.callThrough();
      artifactListDataSourceMock.emulate(fakeArtifacts);

      //directly call ngOnChanges
      component.ngOnChanges({
        projectKey: new SimpleChange(null, artifactListDataSourceMock, true),
      });
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
      expect(component.dataSource.data.length).toEqual(0);
    });
  });
  */

  describe("component rendering", () => {
    let loader: HarnessLoader;
    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);

      artifactListDataSourceMock.emulate(fakeArtifacts);
      // TODO: Fix Tests
      /*component.ngOnChanges({
        artifactListDataSource: new SimpleChange(null, artifactListDataSourceMock, true),
      });*/
      fixture.detectChanges();
    });


    describe("artifacts table", () => {
      it("should contain the artifacts list table", () => {
        // arrange + act also in beforeEach
        let table: HTMLElement = fixture.nativeElement.querySelector("table");

        // assert
        expect(table.textContent).toBeTruthy();
      });

      it("should have defined headers", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const headers: MatHeaderRowHarness[] = await table.getHeaderRows();
        const headerRow: MatRowHarnessColumnsText = await headers[0].getCellTextByColumnName();

        // assert
        expect(Object.keys(headerRow).length).toBe(6);
        expect(headerRow.createdAt).toBe("Created at");
        expect(headerRow.artifactName).toBe("Artifact name");
        expect(headerRow.version).toBe("Version");
        expect(headerRow.runName).toBe("Run name");
        expect(headerRow.runKey).toBe("Run key");
        expect(headerRow.type).toBe("Type");
      });

      it("should show row for each artifact", async () => {
        // arrange + act also in beforeEach
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();

        // assert
        expect(rows.length).toBe(fakeArtifacts.length);
        fakeArtifacts.forEach(async (fakeArtifact, index) => {
          const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();

          expect(row.createdAt).toEqual(String(fakeArtifact.createdAt));
          expect(row.artifactName).toEqual(fakeArtifact.name);
          expect(row.version).toEqual(String(fakeArtifact.version));
          expect(row.runName).toEqual(fakeArtifact.runName);
          expect(row.runKey).toEqual(fakeArtifact.runKey);
          expect(row.type).toEqual(fakeArtifact.type);
        });
      });

      it("should have correct router link to details for each run", async (done) => {
        // arrange + act also in beforeEach

        // assert
        fakeArtifacts.forEach(async (artifact, index) => {
          const runLink: MatButtonHarness = await loader.getHarness(MatButtonHarness.with({ text: artifact.runName }));
          const aElement: TestElement = await runLink.host();

          expect(runLink).toBeTruthy();
          expect(await aElement.getAttribute("href")).toEqual(`/projects/${fakeProject.key}/runs/${artifact.runKey}`);

          if (index == fakeArtifacts.length - 1) {
            done();
          }
        });
      });
    });
  });
});
