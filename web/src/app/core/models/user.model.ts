export type RoleName = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: RoleName;
}
