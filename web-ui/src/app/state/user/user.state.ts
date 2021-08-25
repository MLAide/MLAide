import { User } from "./user.models";

export interface UserState {
  currentUser: User;
  isLoading: boolean;
}
