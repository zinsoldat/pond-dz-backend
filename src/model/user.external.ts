export interface UserExternal {
  userId: string;
  username: string;
  email: string;
  confirmed: boolean;
  registrationDate: Date;
  confirmationDate?: Date;
}
