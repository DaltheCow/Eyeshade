import * as React from "react";
import { getStorage, setStorage, getStorageAll } from "../modules/storage";

const Context = React.createContext({
  isLoaded: false,
  dataStorage: {},
  deleteLink: () => {},
  toggleField: () => {},
});

export const StorageProvider = ({ children }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [dataStorage, setDataStorage] = React.useState({});
  console.log(
    "🚀 ~ file: storage.context.jsx ~ line 14 ~ StorageProvider ~ dataStorage",
    dataStorage
  );

  React.useEffect(() => {
    getStorageAll(["settings"]).then((data) => {
      const { settings } = data;
      const { isBlocking, siteList, isWhiteListing, whiteListSites, redirectLink } = settings;
      setDataStorage({ isBlocking, siteList, isWhiteListing, whiteListSites, redirectLink });
      setIsLoaded(true);
    });
  }, []);

  React.useEffect(() => {
    const listenerFunc = (changes, namespace) => {
      if (changes["settings"]) {
        const { oldValue, newValue } = changes.settings;
        const fields = [
          "isBlocking",
          "siteList",
          "isWhiteListing",
          "whiteListSites",
          "redirectLink",
        ];
        while (JSON.stringify(oldValue[fields[0]]) === JSON.stringify(newValue[fields[0]])) {
          fields.shift();
        }
        setDataStorage({ ...dataStorage, [fields[0]]: newValue[fields[0]] });
      }
    };
    chrome.storage.onChanged.addListener(listenerFunc);

    return () => chrome.storage.onChanged.removeListener(listenerFunc);
  }, [dataStorage]);

  const setFields = (fields) => {
    return getStorage("settings", (data) => {
      const settings = { ...data.settings, ...fields };
      setStorage("settings", { settings }, () => {
        setDataStorage(settings);
      });
    });
  };

  const addSite = (url) => {
    getStorage("settings", (data) => {
      const oldSiteList = data.settings.siteList;
      if (!oldSiteList.includes(url)) {
        const settings = { ...data.settings, siteList: data.settings.siteList.concat(url) };
        setStorage("settings", { settings }, () => {
          setDataStorage(settings);
        });
      }
    });
  };

  const addWhiteListSite = (url) => {
    getStorage("settings", (data) => {
      const whiteListSites = data.settings.whiteListSites;
      if (!whiteListSites.includes(url)) {
        const settings = {
          ...data.settings,
          whiteListSites: data.settings.whiteListSites.concat(url),
        };
        setStorage("settings", { settings }, () => {
          setDataStorage(settings);
        });
      }
    });
  };

  const isStartingStringMatch = (str1, str2) => {
    return str1.indexOf(str2) === 0 || str2.indexOf(str1) === 0;
  };

  const hasConflictWithWhitelist = (redirectLink, whitelistSites) => {
    return whitelistSites.every((url) => !isStartingStringMatch(url, redirectLink));
  };

  const hasConflictWithBlocklist = (redirectLink, blockListSites) => {
    return blockListSites.some((url) => isStartingStringMatch(url, redirectLink));
  };

  const confirmUrlOperation = (typeText) => {
    return confirm(
      `Are you sure you want to do this? Don't let your ${typeText} and your redirect url cross streams!`
    );
  };

  const updateRedirectLink = (url) => {
    const { siteList, whiteListSites } = dataStorage;
    if (!hasConflictWithWhitelist(url, whiteListSites) && !confirmUrlOperation("whitelist")) return;
    if (!hasConflictWithBlocklist(url, siteList) && !confirmUrlOperation("black list")) return;
    getStorage("settings", (data) => {
      const settings = {
        ...data.settings,
        redirectLink: url,
      };
      setStorage("settings", { settings }, () => {
        setDataStorage(settings);
      });
    });
  };

  const deleteLink = (url) => {
    getStorage("settings", (data) => {
      let { siteList } = data.settings;
      siteList = siteList.filter((siteURL) => siteURL !== url);
      let settings = Object.assign({}, data.settings, { siteList });
      setStorage("settings", { settings });
    });
  };

  const deleteWhiteListLink = (url) => {
    if (isStartingStringMatch(url, dataStorage.redirectLink) && !confirmUrlOperation("whitelist"))
      return;
    getStorage("settings", (data) => {
      let { whiteListSites } = data.settings;
      whiteListSites = whiteListSites.filter((siteURL) => siteURL !== url);
      let settings = Object.assign({}, data.settings, { whiteListSites });
      setStorage("settings", { settings });
    });
  };

  return (
    <Context.Provider
      value={{
        isLoaded,
        dataStorage,
        deleteLink,
        deleteWhiteListLink,
        setFields,
        addSite,
        addWhiteListSite,
        updateRedirectLink,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStorageContext = () => {
  return React.useContext(Context);
};
