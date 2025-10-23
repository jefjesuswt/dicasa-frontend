import { Token } from "./token.interface";
import { User } from "./user.interface";

export interface AuthResponse {
  user:  User;
  token: Token;
}



