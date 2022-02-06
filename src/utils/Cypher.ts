import { AES, MD5, PBKDF2, enc, lib, mode, pad } from 'crypto-js';

const { Hex, Utf8 } = enc;
const { Pkcs7 } = pad;
const { CBC } = mode;
const { WordArray } = lib;

const KEY_SIZE = 256;
const iterations = 100;

export const decrypt = (transitmessage: string, password: string): string => {
  transitmessage = transitmessage.replace(/@xZ/gm, '/');
  const saltLength = 128 / 4;
  const salt = Hex.parse(transitmessage.substr(0, saltLength));
  const iv = Hex.parse(transitmessage.substr(saltLength, saltLength));
  const key = PBKDF2(password, salt, { keySize: KEY_SIZE / 32, iterations });
  const decrypted = AES.decrypt(transitmessage.substring(saltLength * 2), key, {
    iv,
    padding: Pkcs7,
    mode: CBC,
  });
  try {
    return decrypted.toString(Utf8);
  } catch (exception) {
    return transitmessage;
  }
};

export const encrypt = (
  message: string,
  password: string,
  random = true
): string => {
  const encrypted = (() => {
    if (random === false) {
      const salt = MD5(password);
      const key = PBKDF2(password, salt, {
        keySize: KEY_SIZE / 32,
        iterations,
      });
      const iv = MD5(message);
      return (
        salt.toString() +
        iv.toString() +
        AES.encrypt(message, key, { iv, padding: Pkcs7, mode: CBC }).toString()
      );
    }
    const localIVSize = 128;
    const salt = WordArray.random(localIVSize / 8);
    const key = PBKDF2(password, salt, { keySize: KEY_SIZE / 32, iterations });
    const iv = WordArray.random(localIVSize / 8);
    return (
      salt.toString() +
      iv.toString() +
      AES.encrypt(message, key, { iv, padding: Pkcs7, mode: CBC }).toString()
    );
  })();
  try {
    if (decrypt(encrypted, password) === message) {
      return encrypted.replace(/\//gm, '@xZ');
    } else {
      return encrypt(message, password);
    }
  } catch (exception) {
    return encrypt(message, password);
  }
};
