import { Artifact, ModelStage } from './../core/models/artifact.model';

const artifact: Artifact = {
    createdAt: new Date(),
    model: {
        createdAt: new Date(),
        stage: ModelStage.STAGING,

    };
    name: string;
    runName: string;
    runKey: string;
    type?: string;
    updatedAt?: Date;
    createdBy: User;
    version: number;
};

export const ARTIFACTS: Artifact[] = [
    {
        createdAt: new Date(),
model: {

}
        name: 'artifact1',
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
