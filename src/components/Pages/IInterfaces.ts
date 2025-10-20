import {
  Absence,
  GuestBook,
  Insentif,
  Participant,
  PermitApps,
  Positions,
  Roles,
  Users,
} from "@prisma/client";

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

export interface IPermitAbsence extends PermitApps {
  Requester: Users;
  Approver: Users | null;
  Insentif?: Insentif;
}

export interface IReport extends Users {
  Absence: Absence[];
  Requester: IPermitAbsence[];
  Positions: Positions;
}
