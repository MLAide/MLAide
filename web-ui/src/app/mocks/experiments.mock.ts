import { ɵPLATFORM_WORKER_UI_ID } from '@angular/common';
import { Experiment, ExperimentStatus } from './../core/models/experiment.model';

export const EXPERIMENTS: Experiment[] = [
    {
        createdAt: new Date(),
        endTime: new Date(),
        id: '1',
        metrics: {
            'Metrik-1': 123,
            'Metrik-2': 123,
        },
        name: 'experiment1',
        parameters: {
            'Parameter-1': 'lala',
            'Parameter-2': 'lala',
            'Parameter-3': 'lala',
        },
        startTime: new Date(),
        status: ExperimentStatus.RUNNING,
        createdBy: {
            id: '1',
            nickName: 'nick1',
        }
    },
    {
        createdAt: new Date(),
        endTime: new Date(),
        id: '2',
        metrics: {
            'Metrik-1': 234,
            'Metrik-2': 234,
        },
        name: 'experiment2',
        parameters: {
            'Parameter-1': 'abab',
            'Parameter-2': 'abab',
            'Parameter-3': 'abab',
        },
        startTime: new Date(),
        status: ExperimentStatus.RUNNING,
        createdBy: {
            id: '2',
            nickName: 'nick2',
        }
    },
    {
        createdAt: new Date(),
        endTime: new Date(),
        id: '3',
        metrics: {
            'Metrik-1': 999,
            'Metrik-2': 999,
        },
        name: 'experiment3',
        parameters: {
            'Parameter-1': 'yzyz',
            'Parameter-2': 'yzyz',
            'Parameter-3': 'yzyz',
        },
        startTime: new Date(),
        status: ExperimentStatus.RUNNING,
        createdBy: {
            id: '3',
            nickName: 'nick3',
        }
    },
];
