import { getStorage, setStorage, getStorageAll } from "../modules/storage";

export enum RedirectEnum {
  URL = "URL",
  BLANK = "BLANK",
  DEFAULT = "DEFAULT",
  ENCOURAGING = "ENCOURAGING",
  OFFENSIVE = "OFFENSIVE",
  CUSTOM = "CUSTOM",
}

export type Tip = {
  title: string;
  text: string;
};

export type TipSettings = {
  tips: Tip[];
  theme: {
    color: {
      backgroundStart: string;
      backgroundEnd: string;
      fontFamily: string;
      fontColor: string;
    };
  };
};

export type Settings = {
  isBlocking?: boolean;
  isWhiteListing?: boolean;
  siteList?: string[];
  whiteListSites?: string[];
  redirectLink?: string;
  redirectOption?: RedirectEnum;
  tipSettings?: TipSettings;
  timer?: number | null;
  savedMinutes: number;
  savedHours: number;
};

(function () {
  getStorageAll(["settings"]).then((data) => {
    ensureSettings(data, (newData: any) => {
      const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption } =
        newData.settings as Settings;
      if (isBlocking || isWhiteListing) {
        chrome.tabs.query({}, function (tabs) {
          const sites = (isWhiteListing ? whiteListSites : siteList) || [];
          Array.from(tabs).forEach((tab) => {
            if (tab.url) {
              blockSites(tab.id, tab.url, sites, isWhiteListing, redirectLink, redirectOption);
            }
          });
        });
      }
    });
  });
})();

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  getStorage("settings", function (data: any) {
    const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption } =
      data.settings;
    if ((isBlocking || isWhiteListing) && changeInfo.url) {
      const sites = isWhiteListing ? whiteListSites : siteList;
      blockSites(tabId, changeInfo.url, sites, isWhiteListing, redirectLink, redirectOption);
    }
  });
});

chrome.alarms.onAlarm.addListener(() => {
  getStorage("settings", (data: any) => {
    const { settings } = data;
    setStorage("settings", {
      settings: { ...settings, timer: null, isBlocking: false, isWhiteListing: false },
    });
  });
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (changes.settings) {
    const { oldValue, newValue } = changes.settings;
    if (oldValue && newValue) {
      const {
        isBlocking: nIsBlocking,
        siteList: nSiteList,
        isWhiteListing: nIsWhiteListing,
        whiteListSites: nWhiteListSites,
        redirectLink,
        redirectOption,
        timer,
      } = newValue;
      // TODO in future can make it possible to turn off block sites and then any page would go back to what was originally searched (if I save searched vid per tab prior to blocking said page). currently blocking it seems to overwrite the page in history
      const blockingWasDisabled =
        (nIsBlocking !== oldValue.isBlocking && !nIsBlocking) ||
        (nIsWhiteListing !== oldValue.isWhiteListing && !nIsWhiteListing);
      if (timer && blockingWasDisabled) {
        chrome.alarms.clearAll();
        setStorage("settings", { settings: { ...newValue, timer: null } });
      }
      if (!timer && oldValue.timer) chrome.alarms.clearAll();
      if (timer && timer !== oldValue.timer) {
        chrome.alarms.clearAll();

        chrome.alarms.create({ delayInMinutes: Math.round((timer - Date.now()) / 1000 / 60) });
      }
      const blockEnabled = nIsBlocking || nIsWhiteListing;
      if (blockEnabled) {
        chrome.tabs.query({}, function (tabs) {
          const siteList = nIsWhiteListing ? nWhiteListSites : nSiteList;
          Array.from(tabs).forEach((tab) => {
            if (tab.url) {
              blockSites(tab.id, tab.url, siteList, nIsWhiteListing, redirectLink, redirectOption);
            }
          });
        });
      }
    }
  }
});

// never block sites with these terms
const ignoreSite = (url: string) => {
  const ignoreSites = ["chrome-extension://", "chrome:"];
  return ignoreSites.some((site) => url.indexOf(site) === 0);
};

function blockSites(
  tabId: any,
  url: string,
  siteList: string[],
  isWhitelist = false,
  redirectLink: string | undefined,
  redirectOption = RedirectEnum.BLANK
) {
  if (ignoreSite(url)) return;
  const isInList = siteList.find((site) => {
    return url.indexOf("https://" + site) === 0 || url.indexOf("http://" + site) === 0;
  });
  const shouldBeBlocked = (isInList && !isWhitelist) || (!isInList && isWhitelist);
  if (shouldBeBlocked) {
    // can I push the current url onto history so it isn't lost before redirect?
    const url =
      redirectOption === RedirectEnum.URL && redirectLink
        ? "https://" + redirectLink
        : "not_available/not_available.html";
    chrome.tabs.update(tabId, { url });
  }
}

function ensureSettings(data: any, callback: any) {
  const prevSettings = data.settings || {};

  let {
    isBlocking,
    siteList,
    isWhiteListing,
    whiteListSites,
    redirectLink,
    redirectOption,
    timer,
    savedMinutes,
    savedHours,
  } = prevSettings;

  isBlocking = Boolean(isBlocking);
  isWhiteListing = Boolean(isWhiteListing);
  siteList = siteList === undefined ? [] : siteList;
  whiteListSites = whiteListSites === undefined ? [] : whiteListSites;
  redirectLink = redirectLink || "";
  redirectOption = redirectOption || RedirectEnum.DEFAULT;
  timer ||= null;
  savedMinutes ||= 0;
  savedHours ||= 0;
  const settings = {
    isBlocking,
    siteList,
    isWhiteListing,
    whiteListSites,
    redirectLink,
    redirectOption,
    timer,
    savedMinutes,
    savedHours,
  };
  //update storage use to new set function
  let newData = {};
  setStorage("settings", { settings }).then((data) => {
    newData = Object.assign(newData, data);
    callback(newData);
  });
}
