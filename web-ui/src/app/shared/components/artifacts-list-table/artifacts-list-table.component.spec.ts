import { HarnessLoader } from "@angular/cdk/testing";
import { TestbedHarnessEnvironment } from "@angular/cdk/testing/testbed";
import { DatePipe } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatHeaderRowHarness, MatRowHarness, MatRowHarnessColumnsText, MatTableHarness } from "@angular/material/table/testing";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { MockPipe } from "ng-mocks";
import { getRandomArtifacts, getRandomProject } from "@mlaide/mocks/fake-generator";

import { ArtifactsListTableComponent } from "./artifacts-list-table.component";
import { of } from "rxjs";
import { MatCardHarness } from "@angular/material/card/testing";
import { MatProgressSpinnerHarness } from "@angular/material/progress-spinner/testing";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";
import { Artifact } from "@mlaide/state/artifact/artifact.models";
import { Project } from "@mlaide/state/project/project.models";
import { MatChipHarness, MatChipListHarness } from "@angular/material/chips/testing";
import { MatChipsModule } from "@angular/material/chips";

describe("ArtifactsListTableComponent", () => {
  let component: ArtifactsListTableComponent;
  let fixture: ComponentFixture<ArtifactsListTableComponent>;

  // fakes
  let fakeArtifacts: Artifact[];
  let fakeProject: Project;

  beforeEach(async () => {
    // setup fakes
    fakeArtifacts = await getRandomArtifacts(3);
    fakeProject = await getRandomProject();

    await TestBed.configureTestingModule({
      declarations: [ArtifactsListTableComponent, MockPipe(DatePipe, (v) => v)],
      imports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatChipsModule,
        RouterTestingModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtifactsListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // setup mocks
    component.projectKey = fakeProject.key;
  });

  it("should create", () => {
    // arrange + act also in beforeEach

    expect(component).toBeTruthy();
  });

  describe("component rendering", () => {
    let loader: HarnessLoader;
    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);
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
        expect(Object.keys(headerRow).length).toBe(5);
        expect(headerRow.createdAt).toBe("Created at");
        expect(headerRow.artifactName).toBe("Artifact name");
        expect(headerRow.version).toBe("Version");
        expect(headerRow.runs).toBe("Runs");
        expect(headerRow.type).toBe("Type");
      });

      it("should show row for each artifact", async () => {
        // arrange + act also in beforeEach
        component.artifacts$ = of(fakeArtifacts);
        fixture.detectChanges();
        const table: MatTableHarness = await loader.getHarness(MatTableHarness);
        const rows: MatRowHarness[] = await table.getRows();
        const chipLists: MatChipListHarness[] = await loader.getAllHarnesses(MatChipListHarness);

        // assert
        expect(rows.length).toBe(fakeArtifacts.length);
        await Promise.all(
          fakeArtifacts.map(async (fakeArtifact, index) => {
            const row: MatRowHarnessColumnsText = await rows[index].getCellTextByColumnName();
            const chips: MatChipHarness[] = await chipLists[index].getChips();

            expect(row.createdAt).toEqual(String(fakeArtifact.createdAt));
            expect(row.artifactName).toEqual(fakeArtifact.name);
            expect(row.version).toEqual(String(fakeArtifact.version));
            expect(row.type).toEqual(fakeArtifact.type);
            await chipsEqualRuns(chips, fakeArtifact);
          })
        );
      });
    });

    describe("progress spinner", () => {
      it("should contain progress spinner if isLoading$ is true", async () => {
        // arrange + act also in beforeEach
        component.isLoading$ = of(true);
        fixture.detectChanges();

        let card: MatCardHarness[] = await loader.getAllHarnesses(MatCardHarness);
        let progressSpinner: MatProgressSpinnerHarness[] = await loader.getAllHarnesses(MatProgressSpinnerHarness);

        // assert
        expect(card.length).toBe(1);
        expect(progressSpinner.length).toBe(1);
      });

      it("should not contain progress spinner if isLoading$ is false", async () => {
        // arrange + act also in beforeEach
        component.isLoading$ = of(false);
        fixture.detectChanges();

        let card: MatCardHarness[] = await loader.getAllHarnesses(MatCardHarness);
        let progressSpinner: MatProgressSpinnerHarness[] = await loader.getAllHarnesses(MatProgressSpinnerHarness);

        // assert
        expect(card.length).toBe(0);
        expect(progressSpinner.length).toBe(0);
      });
    });
  });

  async function chipsEqualRuns(chips: MatChipHarness[], artifact: Artifact) {
    await Promise.all(
      chips.map(async (chip, index) => {
        expect(await chip.getText()).toEqual(`${artifact.runs[index].name} - ${artifact.runs[index].key}`);
      })
    );
  }
});
