import { Component, Input } from "@angular/core";
import { ModelStage } from "../../../../models/artifact.model";

@Component({
  selector: "app-model-stage-i18n",
  templateUrl: "./model-stage-i18n.component.html",
  styleUrls: ["./model-stage-i18n.component.scss"],
})
// https://medium.com/@piotrl/angular-translate-enums-i18n-ec1bb1462181
export class ModelStageI18nComponent {
  @Input()
  key: ModelStage;
}
