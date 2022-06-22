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
    if (typeof window !== 'undefined') {
      const isSessionValue =
        typeof options === 'object' ? options.isSessionValue : options;
      typeof value === 'object' && (value = JSON.stringify(value));
      value = (() => {
        const dataType = typeof value;
        if (
          dataType === 'bigint' ||
          dataType === 'number' ||
          dataType === 'boolean'
        ) {
          return `${value};;;${dataType}`;
        }
        return value;
      })();
      value = encrypt(value, key);
      (isSessionValue ? sessionStorage : localStorage).setItem(
        btoa(encrypt(key, ENCRYPTION_KEY, false)),
        btoa(value)
      );
      typeof options === 'object' &&
        options.expiry &&
        setTimeout(() => this.remove(key, isSessionValue), options.expiry);
    }
  },
  get(key: string, isSessionValue = false) {
    if (typeof window !== 'undefined') {
      let item = (isSessionValue ? sessionStorage : localStorage).getItem(
        btoa(encrypt(key, ENCRYPTION_KEY, false))
      );
      if (item) {
        item = decrypt(atob(item), key);
        item = (() => {
          if (item.match(';;;')) {
            return item.split(';;;')[0];
          }
          return item;
        })();
        try {
          return JSON.parse(item);
        } catch (err) {
          return item;
        }
      }
    }
    return null;
  },
  remove(key: string, isSessionValue = false) {
    if (typeof window !== 'undefined') {
      (isSessionValue ? sessionStorage : localStorage).removeItem(
        btoa(encrypt(key, ENCRYPTION_KEY, false))
      );
    }
  },
  clear(session = false) {
    const storage = session ? sessionStorage : localStorage;
    if (storage) {
      Object.keys(storage).forEach((key) => {
        storage.removeItem(key);
      });
    }
  },
};

export default StorageManager;
