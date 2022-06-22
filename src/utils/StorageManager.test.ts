import StorageManager from './StorageManager';

describe('StorageManager', () => {
  it('should store integer data types without failure', () => {
    const key = 'simpleKey';
    const value = 5;
    expect(() => {
      StorageManager.add(key, value);
    }).not.toThrow();
    const outputValue = StorageManager.get(key);
    expect(outputValue).toBe(value);
  });
  it('should store boolean data types without failure', () => {
    const key = 'simpleKey';
    const value = false;
    expect(() => {
      StorageManager.add(key, value);
    }).not.toThrow();
    const outputValue = StorageManager.get(key);
    expect(outputValue).toBe(value);
  });
  it('should store string data types without failure', () => {
    const key = 'simpleKey';
    const value = 'The string';
    expect(() => {
      StorageManager.add(key, value);
    }).not.toThrow();
    const outputValue = StorageManager.get(key);
    expect(outputValue).toBe(value);
  });
  it('should store object types without failure', () => {
    const key = 'simpleKey';
    const value = {
      key1: 'value',
      key2: 'value',
      tree: {
        key1: 'value',
        key2: 'value',
      },
    };
    expect(() => {
      StorageManager.add(key, value);
    }).not.toThrow();
    const outputValue = StorageManager.get(key);
    expect(outputValue).toEqual(value);
  });
});
