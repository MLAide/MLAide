export interface ProjectMember {
    email: string;
    nickName: string;
    role: ProjectMemberRole;
    userId: string;
}

export enum ProjectMemberRole {
    CONTRIBUTOR = 'CONTRIBUTOR',
    OWNER = 'OWNER',
    VIEWER = 'VIEWER',
}

export interface ProjectMemberListResponse {
    items: ProjectMember[];
}
