import { Component } from "@angular/core";
import { DiffResults } from "ngx-text-diff/lib/ngx-text-diff.model";

@Component({
  selector: "app-file-diff",
  templateUrl: "./file-diff.component.html",
  styleUrls: ["./file-diff.component.scss"],
})
export class FileDiffComponent {
  left = `some text to\nbe compared!`
  right = `A changed\n version \n of the text to\nbe compared!`

  onCompareResults(diffResults: DiffResults) {
    console.log('diffResults', diffResults);
  }
}
