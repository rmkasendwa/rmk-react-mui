import { login, logout } from './api';
import { IUser } from './interfaces';
import StorageManager from './utils/StorageManager';

let loggedInUser: IUser | null = StorageManager.get('user');
let authenticated: boolean = loggedInUser != null;

export const updateLoggedInUserSession = (user: IUser) => {
  loggedInUser = user;
  StorageManager.add('user', user);
  authenticated = true;
};

export const clearLoggedInUserSession = () => {
  loggedInUser = null;
  StorageManager.remove('user');
  authenticated = false;
};

const Auth = {
  async login(
    username: string,
    password: string,
    loginFunction = login
  ): Promise<boolean> {
    clearLoggedInUserSession();
    const user = await loginFunction(username, password);
    user && updateLoggedInUserSession(user);
    return this.isAuthenticated();
  },
  async logout(): Promise<boolean> {
    clearLoggedInUserSession();
    logout();
    StorageManager.clear();
    return this.isAuthenticated();
  },
  isAuthenticated(): boolean {
    return authenticated;
  },
  loggedInUser(): IUser | null {
    return loggedInUser;
  },
  updateLoggedInUser(user: IUser) {
    updateLoggedInUserSession(user);
  },
};

export default Auth;
