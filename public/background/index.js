"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectEnum = void 0;
const storage_1 = require("../modules/storage");
var RedirectEnum;
(function (RedirectEnum) {
    RedirectEnum["URL"] = "URL";
    RedirectEnum["BLANK"] = "BLANK";
    RedirectEnum["DEFAULT"] = "DEFAULT";
    RedirectEnum["ENCOURAGING"] = "ENCOURAGING";
    RedirectEnum["OFFENSIVE"] = "OFFENSIVE";
    RedirectEnum["CUSTOM"] = "CUSTOM";
})(RedirectEnum = exports.RedirectEnum || (exports.RedirectEnum = {}));
(function () {
    (0, storage_1.getStorageAll)(["settings"]).then((data) => {
        ensureSettings(data, (newData) => {
            const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption } = newData.settings;
            if (isBlocking || isWhiteListing) {
                chrome.tabs.query({}, function (tabs) {
                    const sites = isWhiteListing ? whiteListSites : siteList;
                    Array.from(tabs).forEach((tab) => {
                        blockSites(tab.id, tab.url, sites, isWhiteListing, redirectLink, redirectOption);
                    });
                });
            }
        });
    });
})();
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    (0, storage_1.getStorage)("settings", function (data) {
        const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption } = data.settings;
        if ((isBlocking || isWhiteListing) && changeInfo.url) {
            const sites = isWhiteListing ? whiteListSites : siteList;
            blockSites(tabId, changeInfo.url, sites, isWhiteListing, redirectLink, redirectOption);
        }
    });
});
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes.settings) {
        const { oldValue, newValue } = changes.settings;
        if (oldValue && newValue) {
            const { isBlocking: nIsBlocking, siteList: nSiteList, isWhiteListing: nIsWhiteListing, whiteListSites: nWhiteListSites, redirectLink, redirectOption, } = newValue;
            // TODO in future can make it possible to turn off block sites and then any page would go back to what was originally searched (if I save searched vid per tab prior to blocking said page)
            const blockEnabled = nIsBlocking || nIsWhiteListing;
            if (blockEnabled) {
                chrome.tabs.query({}, function (tabs) {
                    const siteList = nIsWhiteListing ? nWhiteListSites : nSiteList;
                    Array.from(tabs).forEach((tab) => {
                        blockSites(tab.id, tab.url, siteList, nIsWhiteListing, redirectLink, redirectOption);
                    });
                });
            }
        }
    }
});
// never block sites with these terms
const ignoreSite = (url) => {
    const ignoreSites = ["chrome-extension://", "chrome:"];
    return ignoreSites.some((site) => url.indexOf(site) === 0);
};
function blockSites(tabId, url, siteList, isWhitelist = false, redirectLink, redirectOption) {
    if (ignoreSite(url))
        return;
    const isInList = siteList.find((site) => {
        return url.indexOf("https://" + site) === 0 || url.indexOf("http://" + site) === 0;
    });
    const shouldBeBlocked = (isInList && !isWhitelist) || (!isInList && isWhitelist);
    if (shouldBeBlocked) {
        // can I push the current url onto history so it isn't lost before redirect?
        const url = redirectOption === RedirectEnum.URL && redirectLink
            ? "https://" + redirectLink
            : "not_available/not_available.html";
        chrome.tabs.update(tabId, { url });
    }
}
function ensureSettings(data, callback) {
    let prevSettings = data.settings || {};
    let { isBlocking, siteList, isWhiteListing, whiteListSites, redirectLink, redirectOption } = prevSettings;
    isBlocking = Boolean(isBlocking);
    isWhiteListing = Boolean(isWhiteListing);
    siteList = siteList === undefined ? [] : siteList;
    whiteListSites = whiteListSites === undefined ? [] : whiteListSites;
    redirectLink = redirectLink || "";
    redirectOption = redirectOption || RedirectEnum.DEFAULT;
    const settings = {
        isBlocking,
        siteList,
        isWhiteListing,
        whiteListSites,
        redirectLink,
        redirectOption,
    };
    //update storage use to new set function
    let newData = {};
    (0, storage_1.setStorage)("settings", { settings }).then((data) => {
        newData = Object.assign(newData, data);
        callback(newData);
    });
}
//# sourceMappingURL=index.js.map