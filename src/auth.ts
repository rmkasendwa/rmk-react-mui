import { login, logout } from './api';
import StorageManager from './utils/StorageManager';

let loggedInUser: any | null = StorageManager.get('user');
let authenticated: boolean = loggedInUser != null;

export const updateLoggedInUserSession = <T = any>(user: T) => {
  loggedInUser = user;
  StorageManager.add('user', user);
  authenticated = true;
};

export const clearLoggedInUserSession = () => {
  StorageManager.remove('user');
  authenticated = false;
};

const Auth = {
  async login(username: string, password: string, loginFunction = login) {
    clearLoggedInUserSession();
    const user = await loginFunction(username, password);
    user && updateLoggedInUserSession(user);
    return this.isAuthenticated();
  },
  async logout() {
    loggedInUser = null;
    clearLoggedInUserSession();
    logout();
    StorageManager.clear();
    return this.isAuthenticated();
  },
  isAuthenticated() {
    return authenticated;
  },
  loggedInUser() {
    return loggedInUser;
  },
  updateLoggedInUser<T = any>(user: T) {
    updateLoggedInUserSession(user);
  },
};

export default Auth;
