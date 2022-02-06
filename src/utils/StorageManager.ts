import { decrypt, encrypt } from './Cypher';

interface IStorageManagerAddOptions {
  isSessionValue?: boolean;
  expiry?: number;
}

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  process.env.APP_NAME ||
  process.env.REACT_APP_NAME ||
  'A really trivial key';

const StorageManager = {
  add(key: string, value: any, options?: boolean | IStorageManagerAddOptions) {
    const isSessionValue =
      typeof options === 'object' ? options.isSessionValue : options;
    typeof value === 'object' && (value = JSON.stringify(value));
    value = encrypt(value, key);
    (isSessionValue ? sessionStorage : localStorage).setItem(
      btoa(encrypt(key, ENCRYPTION_KEY, false)),
      btoa(value)
    );
    typeof options === 'object' &&
      options.expiry &&
      setTimeout(() => this.remove(key, isSessionValue), options.expiry);
  },
  get(key: string, isSessionValue = false) {
    let item = (isSessionValue ? sessionStorage : localStorage).getItem(
      btoa(encrypt(key, ENCRYPTION_KEY, false))
    );
    if (item) {
      item = decrypt(atob(item), key);
      try {
        return JSON.parse(item);
      } catch (err) {
        return item;
      }
    }
    return null;
  },
  remove(key: string, isSessionValue = false) {
    (isSessionValue ? sessionStorage : localStorage).removeItem(
      btoa(encrypt(key, ENCRYPTION_KEY, false))
    );
  },
  clear(session = false) {
    const storage = session ? sessionStorage : localStorage;
    Object.keys(storage).forEach((key) => {
      storage.removeItem(key);
    });
  },
};

export default StorageManager;
