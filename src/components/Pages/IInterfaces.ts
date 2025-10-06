import { GuestBook, Participant, Roles, Users } from "@prisma/client";

export interface IPermission {
  name: string;
  path: string;
  access: string[];
}
export interface IUserRole extends Users {
  Roles: Roles;
}

export interface IGuestBook extends GuestBook {
  Participant: Participant[];
}
