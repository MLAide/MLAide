import { Component, Input } from "@angular/core";
import { RunStatus } from "../../../../models/run.model";

@Component({
  selector: "app-run-status-i18n",
  templateUrl: "./run-status-i18n.component.html",
  styleUrls: ["./run-status-i18n.component.scss"],
})
// https://medium.com/@piotrl/angular-translate-enums-i18n-ec1bb1462181
export class RunStatusI18nComponent {
  @Input()
  key: RunStatus;
}
