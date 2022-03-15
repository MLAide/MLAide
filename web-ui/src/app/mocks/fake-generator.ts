import mocker from "mocker-data-generator";
import { Artifact, CreateOrUpdateModel, ModelRevision, ModelStage } from "@mlaide/state/artifact/artifact.models";
import { User } from "@mlaide/state/user/user.models";
import { ProjectMember, ProjectMemberRole } from "@mlaide/state/project-member/project-member.models";
import { Project } from "@mlaide/state/project/project.models";
import { GitDiff, Run, RunStatus } from "@mlaide/state/run/run.models";
import { Experiment } from "@mlaide/state/experiment/experiment.models";
import { ApiKey } from "@mlaide/state/api-key/api-key.models";
import { SshKey } from "@mlaide/state/ssh-key/ssh-key.models";

const artifactFileSchemaFunction = (faker) => {
  return {
    fileId: faker.datatype.uuid(),
    fileName: faker.system.fileName(),
  };
};

const artifactsRefSchemaFunction = (faker) => {
  return {
    name: faker.lorem.slug(),
    version: faker.datatype.number(),
  };
};

const experimentRefSchemaFunction = (faker) => {
  return {
    experimentKey: faker.lorem.slug(),
  };
};

const gitSchemaFunction = (faker) => {
  return {
    commitTime: faker.date.past(),
    commitHash: faker.datatype.uuid(),
    isDirty: faker.datatype.boolean(),
    repositoryUri: faker.internet.url(),
  };
};

const metaDataSchemaFunction = (faker) => {
  return {
    type: faker.random.word(),
  };
};

const metricsAndParametersSchemaFunction = (faker) => {
  return {
    mae: faker.datatype.float(),
    r2: faker.datatype.float(),
    rmse: faker.datatype.float(),
    number: faker.datatype.number(),
    bool: faker.datatype.boolean(),
  };
};

const modelSchemaFunction = (faker) => {
  return {
    createdAt: faker.date.past(),
    createdBy: userSchemaFunction(faker),
    modelRevisions: [
      {
        function() {
          return artifactsRefSchemaFunction(this.faker);
        },
        length: 3,
        fixedLength: false,
      },
    ],
    // modelRevisions: modelRevisionFunction(faker),
    stage: faker.random.arrayElement(Object.values(ModelStage)),
    updatedAt: faker.date.past(),
  };
};

const modelRevisionFunction = (faker) => {
  return {
    createdAt: faker.date.past(),
    createdBy: userSchemaFunction(faker),
    newStage: faker.random.arrayElement(Object.values(ModelStage)),
    note: faker.lorem.paragraph(),
    oldStage: faker.random.arrayElement(Object.values(ModelStage)),
  }
};

const userSchemaFunction = (faker) => {
  return {
    nickName: faker.name.firstName(),
    userId: faker.datatype.number(),
  };
};

const apiKeySchema = {
  apiKey: {
    faker: "datatype.uuid",
  },
  createdAt: {
    faker: "date.past",
  },
  description: {
    faker: "lorem.paragraph",
  },
  expiresAt: {
    faker: "date.future",
  },
  id: {
    faker: "datatype.uuid",
  },
};

const artifactSchema = {
  createdAt: {
    faker: "date.past",
  },
  createdBy: {
    function() {
      return userSchemaFunction(this.faker);
    },
  },
  files: [
    {
      function() {
        return artifactFileSchemaFunction(this.faker);
      },
      length: 2,
      fixedLength: false,
    },
  ],
  metadata: {
    function() {
      return metaDataSchemaFunction(this.faker);
    },
  },
  model: {
    function() {
      return modelSchemaFunction(this.faker);
    },
  },
  name: {
    faker: "lorem.slug",
  },
  runKey: {
    faker: "lorem.word",
  },
  runName: {
    faker: "lorem.slug",
  },
  updatedAt: {
    faker: "date.past",
  },
  type: {
    faker: "lorem.word",
  },
  version: {
    faker: "datatype.number",
  },
};

const createOrUpdateModelSchema = {
  note: {
    faker: "lorem.paragraph",
  },
  stage: {
    function() {
      return this.faker.random.arrayElement(Object.values(ModelStage));
    },
  },
};

const experimentSchema = {
  createdAt: {
    faker: "date.past",
  },
  key: {
    faker: "lorem.word",
  },
  name: {
    faker: "lorem.slug",
  },
  tags: [
    {
      function() {
        return this.faker.lorem.word();
      },
      length: 10,
      fixedLength: false,
    },
  ],
};

const gitDiffSchema = {
  diff: {
    faker: "lorem.paragraph",
  },
};

const modelRevisionSchema = {
  function() {
    return modelRevisionFunction(this.faker);
  },
};

const runSchema = {
  artifacts: [
    {
      function() {
        return artifactsRefSchemaFunction(this.faker);
      },
      length: 2,
      fixedLength: false,
    },
  ],
  createdAt: {
    faker: "date.past",
  },
  createdBy: {
    function() {
      return userSchemaFunction(this.faker);
    },
  },
  endTime: {
    faker: "date.past",
  },
  experimentRefs: [
    {
      function() {
        return experimentRefSchemaFunction(this.faker);
      },
      length: 2,
      fixedLength: false,
    },
  ],
  git: {
    function() {
      return gitSchemaFunction(this.faker);
    },
  },
  key: {
    faker: "datatype.number",
  },
  metrics: {
    function() {
      return metricsAndParametersSchemaFunction(this.faker);
    },
  },
  name: {
    faker: "lorem.slug",
  },
  note: {
    faker: "lorem.paragraph",
  },
  parameters: {
    function() {
      return metricsAndParametersSchemaFunction(this.faker);
    },
  },
  startTime: {
    faker: "date.past",
  },
  status: {
    values: [RunStatus.COMPLETED, RunStatus.FAILED, RunStatus.RUNNING],
  },
  usedArtifacts: [
    {
      function() {
        return artifactsRefSchemaFunction(this.faker);
      },
      length: 2,
      fixedLength: false,
    },
  ],
};

const projectSchema = {
  key: {
    faker: "lorem.word",
  },
  name: {
    faker: "lorem.slug",
  },
  createdAt: {
    faker: "date.past",
  },
};

const projectMemberSchema = {
  email: {
    faker: "internet.email",
  },
  nickName: {
    faker: "internet.userName",
  },
  role: {
    function() {
      return this.faker.random.arrayElement(Object.values(ProjectMemberRole));
    },
  },
  userId: {
    faker: "datatype.uuid",
  },
};

const sshKeySchema = {
  createdAt: {
    faker: "date.past",
  },
  description: {
    faker: "lorem.paragraph",
  },
  expiresAt: {
    faker: "date.future",
  },
  id: {
    faker: "datatype.uuid",
  },
  publicKey: {
    faker: "datatype.uuid",
  },
};

const userSchema = {
  email: {
    faker: "internet.email",
  },
  firstName: {
    faker: "name.firstName",
  },
  id: {
    faker: "datatype.uuid",
  },
  lastName: {
    faker: "name.lastName",
  },
  nickName: {
    faker: "internet.userName",
  },
};

export const getRandomApiKeys = async (count: number = 1): Promise<ApiKey[]> => {
  const mockerResult = await mocker().schema("fakeApiKeys", apiKeySchema, count).build();

  return mockerResult.fakeApiKeys;
};

export const getRandomApiKey = async (): Promise<ApiKey> => {
  const apiKeys = await getRandomApiKeys();
  return apiKeys[0];
};

export const getRandomArtifacts = async (count: number = 1): Promise<Artifact[]> => {
  const mockerResult = await mocker().schema("fakeArtifacts", artifactSchema, count).build();

  return mockerResult.fakeArtifacts;
};

export const getRandomArtifact = async (): Promise<Artifact> => {
  const artifacts = await getRandomArtifacts();
  return artifacts[0];
};

export const getRandomCreateOrUpdateModels = async (count: number = 1): Promise<CreateOrUpdateModel[]> => {
  const mockerResult = await mocker().schema("fakeCreateOrUpdateModels", createOrUpdateModelSchema, count).build();

  return mockerResult.fakeCreateOrUpdateModels;
};

export const getRandomCreateOrUpdateModel = async (): Promise<CreateOrUpdateModel> => {
  const createOrUpdateModels = await getRandomCreateOrUpdateModels();
  return createOrUpdateModels[0];
};

export const getRandomExperiments = async (count: number = 1): Promise<Experiment[]> => {
  const mockerResult = await mocker().schema("fakeExperiments", experimentSchema, count).build();

  return mockerResult.fakeExperiments;
};

export const getRandomExperiment = async (): Promise<Experiment> => {
  const experiments = await getRandomExperiments();
  return experiments[0];
};

export const getRandomGitDiff = async (): Promise<GitDiff> => {
  const mockerResult = await mocker().schema("fakeGitDiff", gitDiffSchema, 1).build();

  return mockerResult.fakeGitDiff[0];
};

export const getRandomModelRevisions = async (count: number = 1): Promise<ModelRevision[]> => {
  const mockerResult = await mocker().schema("fakeModelRevisions", modelRevisionSchema, count).build();

  return mockerResult.fakeModelRevisions;
};

export const getRandomModelRevision = async (): Promise<ModelRevision> => {
  const modelRevisions = await getRandomModelRevisions();
  return modelRevisions[0];
};

export const getRandomRuns = async (count: number = 1): Promise<Run[]> => {
  const mockerResult = await mocker().schema("fakeRuns", runSchema, count).build();

  return mockerResult.fakeRuns;
};

export const getRandomRun = async (): Promise<Run> => {
  const runs = await getRandomRuns();
  return runs[0];
};

export const getRandomProjects = async (count: number = 1): Promise<Project[]> => {
  const mockerResult = await mocker().schema("fakeProjects", projectSchema, count).build();

  return mockerResult.fakeProjects;
};

export const getRandomProject = async (): Promise<Project> => {
  const projects = await getRandomProjects();
  return projects[0];
};

export const getRandomProjectMembers = async (count: number = 1): Promise<ProjectMember[]> => {
  const mockerResult = await mocker().schema("fakeProjectMembers", projectMemberSchema, count).build();

  return mockerResult.fakeProjectMembers;
};

export const getRandomProjectMember = async (): Promise<ProjectMember> => {
  const projectMembers = await getRandomProjectMembers();
  return projectMembers[0];
};

export const getRandomSshKeys = async (count: number = 1): Promise<SshKey[]> => {
  const mockerResult = await mocker().schema("fakeSshKeys", sshKeySchema, count).build();

  return mockerResult.fakeSshKeys;
};

export const getRandomSshKey = async (): Promise<SshKey> => {
  const sshKeys = await getRandomSshKeys();
  return sshKeys[0];
};

export const getRandomUsers = async (count: number = 1): Promise<User[]> => {
  const mockerResult = await mocker().schema("fakeUsers", userSchema, count).build();

  return mockerResult.fakeUsers;
};

export const getRandomUser = async (): Promise<User> => {
  const users = await getRandomUsers();
  return users[0];
};
