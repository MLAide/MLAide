export interface Project {
  createdAt: Date;
  key: string;
  name: string;
}

export interface ProjectListResponse {
  items: Project[];
}
