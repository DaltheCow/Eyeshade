import { Settings } from "background";
import * as React from "react";
import { getStorage, setStorage, getStorageAll } from "../modules/storage";

const Context = React.createContext({
  isLoaded: false,
  dataStorage: {} as Settings,
  deleteLink: (url: string) => {},
  deleteWhiteListLink: (url: string) => {},
  setFields: (fields: any) => {},
  addSite: (url: any) => {},
  addWhiteListSite: (url: string) => {},
  updateRedirectLink: (url: string) => {},
  updateRedirectOption: (redirectOption: string) => {},
});

type StorageContextProps = {
  children: any;
};

export const StorageProvider = ({ children }: StorageContextProps) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [dataStorage, setDataStorage] = React.useState({} as Settings);

  React.useEffect(() => {
    getStorageAll(["settings"]).then((data) => {
      const { settings } = data as any;
      const { isBlocking, siteList, isWhiteListing, whiteListSites, redirectLink, redirectOption } =
        settings;
      setDataStorage({
        isBlocking,
        siteList,
        isWhiteListing,
        whiteListSites,
        redirectLink,
        redirectOption,
      });
      setIsLoaded(true);
    });
  }, []);

  React.useEffect(() => {
    const listenerFunc = (changes: any) => {
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

  const setFields = (fields: any) => {
    return getStorage("settings", (data: any) => {
      const settings = { ...data.settings, ...fields };
      setStorage("settings", { settings }, () => {
        setDataStorage(settings);
      });
    });
  };

  const addSite = (url: any) => {
    getStorage("settings", (data: any) => {
      const oldSiteList = data.settings.siteList;
      if (!oldSiteList.includes(url)) {
        const settings = { ...data.settings, siteList: data.settings.siteList.concat(url) };
        setStorage("settings", { settings }, () => {
          setDataStorage(settings);
        });
      }
    });
  };

  const addWhiteListSite = (url: any) => {
    getStorage("settings", (data: any) => {
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

  const isStartingStringMatch = (str1: string, str2: string) => {
    return str1.indexOf(str2) === 0 || str2.indexOf(str1) === 0;
  };

  const hasConflictWithWhitelist = (redirectLink: string, whitelistSites: string[]) => {
    return whitelistSites.every((url: any) => !isStartingStringMatch(url, redirectLink));
  };

  const hasConflictWithBlocklist = (redirectLink: string, blockListSites: string[]) => {
    return blockListSites.some((url) => isStartingStringMatch(url, redirectLink));
  };

  const confirmUrlOperation = (typeText: string) => {
    return confirm(
      `Are you sure you want to do this? Don't let your ${typeText} and your redirect url cross streams!`
    );
  };

  const updateRedirectLink = (url: string) => {
    const { siteList, whiteListSites } = dataStorage as any;
    if (!hasConflictWithWhitelist(url, whiteListSites) && !confirmUrlOperation("whitelist")) return;
    if (!hasConflictWithBlocklist(url, siteList) && !confirmUrlOperation("black list")) return;
    getStorage("settings", (data: any) => {
      const settings = {
        ...data.settings,
        redirectLink: url,
      };
      setStorage("settings", { settings }, () => {
        setDataStorage(settings);
      });
    });
  };

  const deleteLink = (url: string) => {
    getStorage("settings", (data: any) => {
      let { siteList } = data.settings;
      siteList = siteList.filter((siteURL: string) => siteURL !== url);
      let settings = Object.assign({}, data.settings, { siteList });
      setStorage("settings", { settings });
    });
  };

  const deleteWhiteListLink = (url: string) => {
    if (isStartingStringMatch(url, dataStorage?.redirectLink) && !confirmUrlOperation("whitelist"))
      return;
    getStorage("settings", (data: any) => {
      let { whiteListSites } = data.settings;
      whiteListSites = whiteListSites.filter((siteURL: string) => siteURL !== url);
      let settings = Object.assign({}, data.settings, { whiteListSites });
      setStorage("settings", { settings });
    });
  };

  const updateRedirectOption = (redirectOption: string) => {
    getStorage("settings", (data: any) => {
      let settings = Object.assign({}, data.settings, { redirectOption });
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
        updateRedirectOption,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStorageContext = () => {
  return React.useContext(Context);
};
