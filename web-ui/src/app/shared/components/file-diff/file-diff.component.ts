import { AfterViewInit, Component, ElementRef, Input, ViewChild } from "@angular/core";
import * as Diff2Html from 'diff2html';
import { GitDiff } from "@mlaide/state/run/run.models";
import { Observable } from "rxjs";
import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui";

@Component({
  selector: "app-file-diff",
  templateUrl: "./file-diff.component.html",
  styleUrls: ["./file-diff.component.scss"],
})
export class FileDiffComponent implements AfterViewInit {
  @ViewChild("gitDiff") public gitDiffElement: ElementRef;
  @Input() public gitDiff$: Observable<GitDiff>;

  private diffConfig: Diff2Html.Diff2HtmlConfig = {
    drawFileList:true,
    matching: "lines",
    outputFormat: "side-by-side"
  };

  ngAfterViewInit(): void {
    this.gitDiff$.subscribe(gitDiff => {
      const diff2htmlUi = new Diff2HtmlUI(this.gitDiffElement.nativeElement, gitDiff.diff, this.diffConfig);
      diff2htmlUi.draw();
    });
  }
}
