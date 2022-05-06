export const getStorage = (key, callback) => {
  const storage = key === "settings" ? chrome.storage.sync : chrome.storage.local;
  let promise = new Promise((resolve) => {
    storage.get(key, (data) => resolve(data));
  });
  return callback ? promise.then(callback) : promise;
};

export const setStorage = (key, object, callback) => {
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

export const getStorageAll = (keys, callback) => {
  const storagesKeys = keys.map((key) => {
    return { key, storage: chrome.storage[key === "settings" ? "sync" : "local"] };
  });
  let promise = Promise.all(
    storagesKeys.map((storageKey) => {
      const { storage, key } = storageKey;
      return new Promise((resolve) => {
        storage.get(key, (data) => resolve(data));
      });
    })
  ).then((res) => {
    const data = {};
    res.forEach((item, idx) => (data[keys[idx]] = item[keys[idx]]));
    return data;
  });
  return callback ? promise.then(callback) : promise;
};
