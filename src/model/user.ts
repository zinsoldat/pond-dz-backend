import { UserExternal } from './user.external';

export interface User extends UserExternal {
  password: string;
}
