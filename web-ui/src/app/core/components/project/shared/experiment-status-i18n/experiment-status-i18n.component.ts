import { Component, Input, OnInit } from '@angular/core';
import { ExperimentStatus } from '../../../../models/experiment.model';

@Component({
  selector: 'app-experiment-status-i18n',
  templateUrl: './experiment-status-i18n.component.html',
  styleUrls: ['./experiment-status-i18n.component.scss']
})

// https://medium.com/@piotrl/angular-translate-enums-i18n-ec1bb1462181
export class ExperimentStatusI18nComponent implements OnInit {
  @Input()
  key: ExperimentStatus;
  constructor() { }

  ngOnInit(): void {
  }

}
