import { RedirectEnum, Settings } from "../background";
import * as React from "react";
import { getStorage, setStorage, getStorageAll } from "../modules/storage";

const Context = React.createContext({
  isLoaded: false,
  dataStorage: {} as Settings,
  deleteLink: (url: string) => {
    //nothing
  },
  deleteWhiteListLink: (url: string) => {
    //nothing
  },
  setToggles: (fields: { isBlocking: boolean; isWhiteListing: boolean }) => {
    //nothing
  },
  addSite: (url: string) => {
    //nothing
  },
  addWhiteListSite: async (url: string) => new Promise(() => Promise.resolve()),
  updateRedirectLink: async (url: string) => {
    //nothing
  },
  updateRedirectOption: (redirectOption: string) => {
    //nothing
  },
  setTimer: async (timer: number | null, timerMinutes?: number, timerHours?: number) =>
    new Promise(() => Promise.resolve()),
});

type StorageContextProps = {
  children: any;
};

enum FieldUpdateEnum {
  UPDATE_REDIRECT_OPTION = "update redirectOption",
  UPDATE_REDIRECT_LINK = "update redirectLink",
  ADD_TO_SITELIST = "add to siteList",
  UPDATE_IS_BLOCKING = "update isBlocking",
  UPDATE_IS_WHITELISTING = "update isWhiteListing",
  REMOVE_FROM_WHITELIST = "remove from whitelist",
}

export const StorageProvider = ({ children }: StorageContextProps) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [dataStorage, setDataStorage] = React.useState({} as Settings);

  React.useEffect(() => {
    getStorageAll(["settings"]).then((data) => {
      const { settings } = data as any;
      const {
        isBlocking,
        siteList,
        isWhiteListing,
        whiteListSites,
        redirectLink,
        redirectOption,
        timer,
        savedMinutes,
        savedHours,
      } = settings;
      setDataStorage({
        isBlocking,
        siteList,
        isWhiteListing,
        whiteListSites,
        redirectLink,
        redirectOption,
        timer,
        savedMinutes,
        savedHours,
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
          "redirectOption",
          "timer",
          "savedMinutes",
          "savedHours",
        ];
        while (JSON.stringify(oldValue[fields[0]]) === JSON.stringify(newValue[fields[0]])) {
          fields.shift();
        }
        const updates = {} as any;
        fields.forEach((field) => {
          updates[field] = newValue[field];
        });
        setDataStorage({ ...dataStorage, ...updates });
      }
    };
    chrome.storage.onChanged.addListener(listenerFunc);

    return () => chrome.storage.onChanged.removeListener(listenerFunc);
  }, [dataStorage]);

  const setToggles = async (fields: { isBlocking: boolean; isWhiteListing: boolean }) => {
    for (const prop in fields) {
      const fieldUpdate =
        prop === "isBlocking"
          ? FieldUpdateEnum.UPDATE_IS_BLOCKING
          : FieldUpdateEnum.UPDATE_IS_WHITELISTING;
      if (prop === "isBlocking" || prop === "isWhiteListing") {
        await conflictHandler(fieldUpdate, fields[prop]);
      }
    }
    getStorage("settings", (data: any) => {
      const settings = { ...data.settings, ...fields };
      setStorage("settings", { settings }, () => {
        setDataStorage(settings);
      });
    });
  };

  const addSite = async (url: string) => {
    await conflictHandler(FieldUpdateEnum.ADD_TO_SITELIST, url);
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

  const addWhiteListSite = async (url: string) => {
    return getStorage("settings", (data: any) => {
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

  const updateRedirectLink = async (url: string) => {
    await conflictHandler(FieldUpdateEnum.UPDATE_REDIRECT_LINK, url);
    getStorage("settings", (data: any) => {
      const settings = {
        ...data.settings,
        redirectLink: url,
      };
      setStorage("settings", { settings });
    });
  };

  const deleteLink = (url: string) => {
    getStorage("settings", (data: any) => {
      let { siteList } = data.settings;
      siteList = siteList.filter((siteURL: string) => siteURL !== url);
      const settings = Object.assign({}, data.settings, { siteList });
      setStorage("settings", { settings });
    });
  };

  const deleteWhiteListLink = async (url: string) => {
    await conflictHandler(FieldUpdateEnum.REMOVE_FROM_WHITELIST, url);
    getStorage("settings", (data: any) => {
      let { whiteListSites } = data.settings;
      whiteListSites = whiteListSites.filter((siteURL: string) => siteURL !== url);
      const settings = Object.assign({}, data.settings, { whiteListSites });
      setStorage("settings", { settings });
    });
  };

  const updateRedirectOption = async (redirectOption: string) => {
    await conflictHandler(FieldUpdateEnum.UPDATE_REDIRECT_OPTION, redirectOption);
    getStorage("settings", (data: any) => {
      const settings = Object.assign({}, data.settings, { redirectOption });
      setStorage("settings", { settings });
    });
  };

  const isStartingStringMatch = (str1: string, str2: string | undefined) => {
    return str1 && str2 && (str1.indexOf(str2) === 0 || str2.indexOf(str1) === 0);
  };

  const hasConflictWithWhitelist = (
    redirectLink: string | undefined,
    whitelistSites: string[] | undefined
  ) => {
    return (
      redirectLink &&
      whitelistSites?.every((url: string) => !isStartingStringMatch(url, redirectLink))
    );
  };

  const hasConflictWithBlocklist = (
    redirectLink: string | undefined,
    blockListSites: string[] | undefined
  ) => {
    return redirectLink && blockListSites?.some((url) => isStartingStringMatch(url, redirectLink));
  };

  const conflictHandler = async (action: FieldUpdateEnum, value: any) => {
    const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption } =
      dataStorage;
    switch (action) {
      case FieldUpdateEnum.UPDATE_REDIRECT_OPTION: {
        if (value === RedirectEnum.URL && redirectLink) {
          if (hasConflictWithWhitelist(redirectLink, whiteListSites) && isWhiteListing) {
            await addWhiteListSite(redirectLink);
            // add notification "we added <url> to your whitelist"
          }
          if (hasConflictWithBlocklist(redirectLink, siteList) && isBlocking) {
            alert(
              `Your redirect website could cause issues. You have ${redirectLink} as your redirect website and that website is also in your block list`
            );
          }
        }
        break;
      }
      case FieldUpdateEnum.UPDATE_REDIRECT_LINK: {
        if (redirectOption === RedirectEnum.URL) {
          if (hasConflictWithWhitelist(value, whiteListSites) && isWhiteListing) {
            await addWhiteListSite(value);
            // add notification "we added <url> to your whitelist"
          }
          if (hasConflictWithBlocklist(value, siteList) && isBlocking) {
            alert(
              `Using this redirect website could cause issues. This website is also in your block list`
            );
          }
        }
        break;
      }
      case FieldUpdateEnum.ADD_TO_SITELIST: {
        if (
          redirectOption === RedirectEnum.URL &&
          isStartingStringMatch(value, redirectLink) &&
          isBlocking
        ) {
          alert(
            `Adding this site could cause issues. You have ${redirectLink} as your redirect website`
          );
        }
        break;
      }
      case FieldUpdateEnum.UPDATE_IS_BLOCKING: {
        if (
          redirectOption === RedirectEnum.URL &&
          value &&
          hasConflictWithBlocklist(redirectLink, siteList)
        ) {
          alert(
            `Activating blocking could cause issues. You have ${redirectLink} as your redirect website and that website is also in your block list`
          );
        }
        break;
      }
      case FieldUpdateEnum.UPDATE_IS_WHITELISTING: {
        if (
          redirectOption === RedirectEnum.URL &&
          value &&
          redirectLink &&
          hasConflictWithWhitelist(redirectLink, whiteListSites)
        ) {
          await addWhiteListSite(redirectLink);
          // add notification "we added <url> to your whitelist"
        }
        break;
      }
      case FieldUpdateEnum.REMOVE_FROM_WHITELIST: {
        if (
          redirectOption === RedirectEnum.URL &&
          isWhiteListing &&
          isStartingStringMatch(value, redirectLink)
        ) {
          alert(
            `Removing this from the whitelist could cause issues. You have ${redirectLink} as your redirect website`
          );
        }
        break;
      }
      default:
        return;
    }
  };

  const setTimer = async (timer: number | null, timerMinutes?: number, timerHours?: number) => {
    const { isBlocking, isWhiteListing } = dataStorage;
    if (!isBlocking && !isWhiteListing) {
      alert("You must have blocking or white listing on to use the timer");
      return;
    }
    return getStorage("settings", (data: any) => {
      const updates = { timer } as any;
      if (timerMinutes || timerHours) {
        updates.savedMinutes = timerMinutes;
        updates.savedHours = timerHours;
      }
      const settings = {
        ...data.settings,
        ...updates,
      };
      return setStorage("settings", { settings });
    });
  };

  const values = React.useMemo(() => {
    return {
      isLoaded,
      dataStorage,
      deleteLink,
      deleteWhiteListLink,
      setToggles,
      addSite,
      addWhiteListSite,
      updateRedirectLink,
      updateRedirectOption,
      setTimer,
    };
  }, [
    isLoaded,
    dataStorage,
    deleteLink,
    deleteWhiteListLink,
    setToggles,
    addSite,
    addWhiteListSite,
    updateRedirectLink,
    updateRedirectOption,
    setTimer,
  ]);

  return <Context.Provider value={values}>{children}</Context.Provider>;
};

export const useStorageContext = () => {
  return React.useContext(Context);
};
