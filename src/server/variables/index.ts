import { User } from '@prisma/client';

export type VariablesHono = {
  user_id?: string;
};

export type VariablesHonoAuth = {
  user_id?: string;
  user: User;
};
