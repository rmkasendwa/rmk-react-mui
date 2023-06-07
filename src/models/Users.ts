export type PermissionCode = 'ALL_FUNCTIONS' | string;

export interface User {
  email: string;
  fullName: string;
  profilePictureUrl: string;
  permissions: PermissionCode[];
}
