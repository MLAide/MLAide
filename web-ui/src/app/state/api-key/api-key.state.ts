import { ApiKey } from "./api-key.models";

export interface ApiKeyState {
  isLoading: boolean;
  items: ApiKey[];
  newCreatedApiKey: ApiKey;
}
