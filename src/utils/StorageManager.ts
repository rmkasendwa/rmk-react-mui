import { HmacSHA512, enc } from 'crypto-js';

import { decrypt, encrypt } from './Cypher';

const { Base64 } = enc;

interface StorageManagerAddOptions {
  isSessionValue?: boolean;
  expiry?: number;
}

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  process.env.APP_NAME ||
  process.env.REACT_APP_NAME ||
  (() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
  })() ||
  'A really trivial key';

const getEncryptedKey = (key: string) => {
  return Base64.stringify(HmacSHA512(key, ENCRYPTION_KEY)).substring(
    0,
    key.length
  );
};

const StorageManager = {
  add(key: string, value: any, options?: boolean | StorageManagerAddOptions) {
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
        getEncryptedKey(key),
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
        getEncryptedKey(key)
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
        getEncryptedKey(key)
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
