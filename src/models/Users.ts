export type PermissionCode<PermisionType extends string = string> =
  | 'ALL_FUNCTIONS'
  | PermisionType;

export interface User {
  email: string;
  fullName: string;
  profilePictureUrl: string;
  permissions: PermissionCode[];
}
