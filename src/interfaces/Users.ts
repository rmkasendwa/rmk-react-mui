export type TPermissionCode = 'ALL_FUNCTIONS' | string;

export interface IUser {
  email: string;
  fullName: string;
  profilePictureUrl: string;
  permissions: TPermissionCode[];
}
