export const getStorage = (key: string, callback?: any) => {
  const storage = key === "settings" ? chrome.storage.sync : chrome.storage.local;
  let promise = new Promise((resolve) => {
    storage.get(key, (data) => resolve(data));
  });
  return callback ? promise.then(callback) : promise;
};

export const setStorage = (key: string, object: any, callback?: any) => {
  const storage = key === "settings" ? chrome.storage.sync : chrome.storage.local;
  let promise = new Promise((resolve) => {
    storage.set(object, () => {
      storage.get(key, (data) => {
        return resolve(data);
      });
    });
  });
  return callback ? promise.then(callback) : promise;
};

export const getStorageAll = (keys: any, callback?: any) => {
  const storagesKeys = keys.map((key: string) => {
    return { key, storage: chrome.storage[key === "settings" ? "sync" : "local"] };
  });
  let promise = Promise.all(
    storagesKeys.map((storageKey: any) => {
      const { storage, key } = storageKey;
      return new Promise((resolve) => {
        storage.get(key, (data: any) => resolve(data));
      });
    })
  ).then((res) => {
    const data = {} as any;
    res.forEach((item, idx) => (data[keys[idx]] = item[keys[idx]]));
    return data;
  });
  return callback ? promise.then(callback) : promise;
};
