export interface ApiKey {
    apiKey: string;
    createdAt: Date;
    description:	string;
    expiresAt: Date;
    id: string;
}

export interface ApiKeyListResponse {
    items: ApiKey[];
  }
