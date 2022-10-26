/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./background/index.ts":
/*!*****************************!*\
  !*** ./background/index.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RedirectEnum = void 0;
const storage_1 = __webpack_require__(/*! ../modules/storage */ "./modules/storage.ts");
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
            const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption, isHttps, } = newData.settings;
            if (isBlocking || isWhiteListing) {
                chrome.tabs.query({}, function (tabs) {
                    const sites = (isWhiteListing ? whiteListSites : siteList) || [];
                    Array.from(tabs).forEach((tab) => {
                        if (tab.url) {
                            blockSites(tab.id, tab.url, isHttps, sites, isWhiteListing, redirectLink, redirectOption);
                        }
                    });
                });
            }
        });
    });
})();
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    (0, storage_1.getStorage)("settings", function (data) {
        const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption, isHttps, } = data.settings;
        if ((isBlocking || isWhiteListing) && changeInfo.url) {
            const sites = isWhiteListing ? whiteListSites : siteList;
            blockSites(tabId, changeInfo.url, isHttps, sites, isWhiteListing, redirectLink, redirectOption);
        }
    });
});
chrome.alarms.onAlarm.addListener(() => {
    (0, storage_1.getStorage)("settings", (data) => {
        const { settings } = data;
        (0, storage_1.setStorage)("settings", {
            settings: Object.assign(Object.assign({}, settings), { timer: null, isBlocking: false, isWhiteListing: false }),
        });
    });
});
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes.settings) {
        const { oldValue, newValue } = changes.settings;
        if (oldValue && newValue) {
            const { isBlocking: nIsBlocking, siteList: nSiteList, isWhiteListing: nIsWhiteListing, whiteListSites: nWhiteListSites, redirectLink, redirectOption, timer, isHttps, } = newValue;
            // TODO in future can make it possible to turn off block sites and then any page would go back to what was originally searched (if I save searched vid per tab prior to blocking said page). currently blocking it seems to overwrite the page in history
            const blockingWasDisabled = (nIsBlocking !== oldValue.isBlocking && !nIsBlocking) ||
                (nIsWhiteListing !== oldValue.isWhiteListing && !nIsWhiteListing);
            if (timer && blockingWasDisabled) {
                chrome.alarms.clearAll();
                (0, storage_1.setStorage)("settings", { settings: Object.assign(Object.assign({}, newValue), { timer: null }) });
            }
            if (!timer && oldValue.timer)
                chrome.alarms.clearAll();
            if (timer && timer !== oldValue.timer) {
                chrome.alarms.clearAll();
                console.log("created timer");
                chrome.alarms.create({ delayInMinutes: Math.round((timer - Date.now()) / 1000 / 60) });
            }
            const blockEnabled = nIsBlocking || nIsWhiteListing;
            if (blockEnabled) {
                chrome.tabs.query({}, function (tabs) {
                    const siteList = nIsWhiteListing ? nWhiteListSites : nSiteList;
                    Array.from(tabs).forEach((tab) => {
                        if (tab.url) {
                            blockSites(tab.id, tab.url, isHttps, siteList, nIsWhiteListing, redirectLink, redirectOption);
                        }
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
function blockSites(tabId, url, isHttps, siteList, isWhitelist = false, redirectLink, redirectOption = RedirectEnum.BLANK) {
    if (ignoreSite(url))
        return;
    const isInList = siteList.find((site) => {
        return url.indexOf("https://" + site) === 0 || url.indexOf("http://" + site) === 0;
    });
    const shouldBeBlocked = (isInList && !isWhitelist) || (!isInList && isWhitelist);
    if (shouldBeBlocked) {
        // can I push the current url onto history so it isn't lost before redirect?
        const url = redirectOption === RedirectEnum.URL && redirectLink
            ? (isHttps ? "https://" : "http://") + redirectLink
            : "not_available/not_available.html";
        chrome.tabs.update(tabId, { url });
    }
}
function ensureSettings(data, callback) {
    const prevSettings = data.settings || {};
    let { isBlocking, siteList, isWhiteListing, whiteListSites, redirectLink, redirectOption, timer, savedMinutes, savedHours, isHttps, } = prevSettings;
    isBlocking = Boolean(isBlocking);
    isWhiteListing = Boolean(isWhiteListing);
    siteList = siteList === undefined ? [] : siteList;
    whiteListSites = whiteListSites === undefined ? [] : whiteListSites;
    redirectLink = redirectLink || "";
    redirectOption = redirectOption || RedirectEnum.DEFAULT;
    timer || (timer = null);
    savedMinutes || (savedMinutes = 0);
    savedHours || (savedHours = 0);
    isHttps = isHttps !== false;
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
        isHttps,
    };
    //update storage use to new set function
    let newData = {};
    (0, storage_1.setStorage)("settings", { settings }).then((data) => {
        newData = Object.assign(newData, data);
        callback(newData);
    });
}


/***/ }),

/***/ "./modules/storage.ts":
/*!****************************!*\
  !*** ./modules/storage.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getStorageAll = exports.setStorage = exports.getStorage = void 0;
const getStorage = (key, callback) => {
    const storage = key === "settings" ? chrome.storage.sync : chrome.storage.local;
    const promise = new Promise((resolve) => {
        storage.get(key, (data) => resolve(data));
    });
    return callback ? promise.then(callback) : promise;
};
exports.getStorage = getStorage;
const setStorage = (key, object, callback) => {
    const storage = key === "settings" ? chrome.storage.sync : chrome.storage.local;
    const promise = new Promise((resolve) => {
        storage.set(object, () => {
            storage.get(key, (data) => {
                return resolve(data);
            });
        });
    });
    return callback ? promise.then(callback) : promise;
};
exports.setStorage = setStorage;
const getStorageAll = (keys, callback) => {
    const storagesKeys = keys.map((key) => {
        return { key, storage: chrome.storage[key === "settings" ? "sync" : "local"] };
    });
    const promise = Promise.all(storagesKeys.map((storageKey) => {
        const { storage, key } = storageKey;
        return new Promise((resolve) => {
            storage.get(key, (data) => resolve(data));
        });
    })).then((res) => {
        const data = {};
        res.forEach((item, idx) => (data[keys[idx]] = item[keys[idx]]));
        return data;
    });
    return callback ? promise.then(callback) : promise;
};
exports.getStorageAll = getStorageAll;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./background/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leWVzaGFkZS8uL2JhY2tncm91bmQvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvLi9tb2R1bGVzL3N0b3JhZ2UudHMiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSx3RkFBMkU7QUFFM0UsSUFBWSxZQU9YO0FBUEQsV0FBWSxZQUFZO0lBQ3RCLDJCQUFXO0lBQ1gsK0JBQWU7SUFDZixtQ0FBbUI7SUFDbkIsMkNBQTJCO0lBQzNCLHVDQUF1QjtJQUN2QixpQ0FBaUI7QUFDbkIsQ0FBQyxFQVBXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBT3ZCO0FBaUNELENBQUM7SUFDQywyQkFBYSxFQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUN4QyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBWSxFQUFFLEVBQUU7WUFDcEMsTUFBTSxFQUNKLFVBQVUsRUFDVixjQUFjLEVBQ2QsUUFBUSxFQUNSLGNBQWMsRUFDZCxZQUFZLEVBQ1osY0FBYyxFQUNkLE9BQU8sR0FDUixHQUFHLE9BQU8sQ0FBQyxRQUFvQixDQUFDO1lBQ2pDLElBQUksVUFBVSxJQUFJLGNBQWMsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFVBQVUsSUFBSTtvQkFDbEMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNqRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUMvQixJQUFJLEdBQUcsQ0FB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QUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQ3JELENBQUMsQ0FBQztBQWpCVyxxQkFBYSxpQkFpQnhCOzs7Ozs7O1VDckNGO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUN0QkE7VUFDQTtVQUNBO1VBQ0EiLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFN0b3JhZ2UsIHNldFN0b3JhZ2UsIGdldFN0b3JhZ2VBbGwgfSBmcm9tIFwiLi4vbW9kdWxlcy9zdG9yYWdlXCI7XG5cbmV4cG9ydCBlbnVtIFJlZGlyZWN0RW51bSB7XG4gIFVSTCA9IFwiVVJMXCIsXG4gIEJMQU5LID0gXCJCTEFOS1wiLFxuICBERUZBVUxUID0gXCJERUZBVUxUXCIsXG4gIEVOQ09VUkFHSU5HID0gXCJFTkNPVVJBR0lOR1wiLFxuICBPRkZFTlNJVkUgPSBcIk9GRkVOU0lWRVwiLFxuICBDVVNUT00gPSBcIkNVU1RPTVwiLFxufVxuXG5leHBvcnQgdHlwZSBUaXAgPSB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFRpcFNldHRpbmdzID0ge1xuICB0aXBzOiBUaXBbXTtcbiAgdGhlbWU6IHtcbiAgICBjb2xvcjoge1xuICAgICAgYmFja2dyb3VuZFN0YXJ0OiBzdHJpbmc7XG4gICAgICBiYWNrZ3JvdW5kRW5kOiBzdHJpbmc7XG4gICAgICBmb250RmFtaWx5OiBzdHJpbmc7XG4gICAgICBmb250Q29sb3I6IHN0cmluZztcbiAgICB9O1xuICB9O1xufTtcblxuZXhwb3J0IHR5cGUgU2V0dGluZ3MgPSB7XG4gIGlzQmxvY2tpbmc/OiBib29sZWFuO1xuICBpc1doaXRlTGlzdGluZz86IGJvb2xlYW47XG4gIHNpdGVMaXN0Pzogc3RyaW5nW107XG4gIHdoaXRlTGlzdFNpdGVzPzogc3RyaW5nW107XG4gIHJlZGlyZWN0TGluaz86IHN0cmluZztcbiAgcmVkaXJlY3RPcHRpb24/OiBSZWRpcmVjdEVudW07XG4gIHRpcFNldHRpbmdzPzogVGlwU2V0dGluZ3M7XG4gIHRpbWVyPzogbnVtYmVyIHwgbnVsbDtcbiAgc2F2ZWRNaW51dGVzOiBudW1iZXI7XG4gIHNhdmVkSG91cnM6IG51bWJlcjtcbiAgaXNIdHRwczogYm9vbGVhbjtcbn07XG5cbihmdW5jdGlvbiAoKSB7XG4gIGdldFN0b3JhZ2VBbGwoW1wic2V0dGluZ3NcIl0pLnRoZW4oKGRhdGEpID0+IHtcbiAgICBlbnN1cmVTZXR0aW5ncyhkYXRhLCAobmV3RGF0YTogYW55KSA9PiB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGlzQmxvY2tpbmcsXG4gICAgICAgIGlzV2hpdGVMaXN0aW5nLFxuICAgICAgICBzaXRlTGlzdCxcbiAgICAgICAgd2hpdGVMaXN0U2l0ZXMsXG4gICAgICAgIHJlZGlyZWN0TGluayxcbiAgICAgICAgcmVkaXJlY3RPcHRpb24sXG4gICAgICAgIGlzSHR0cHMsXG4gICAgICB9ID0gbmV3RGF0YS5zZXR0aW5ncyBhcyBTZXR0aW5ncztcbiAgICAgIGlmIChpc0Jsb2NraW5nIHx8IGlzV2hpdGVMaXN0aW5nKSB7XG4gICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCBmdW5jdGlvbiAodGFicykge1xuICAgICAgICAgIGNvbnN0IHNpdGVzID0gKGlzV2hpdGVMaXN0aW5nID8gd2hpdGVMaXN0U2l0ZXMgOiBzaXRlTGlzdCkgfHwgW107XG4gICAgICAgICAgQXJyYXkuZnJvbSh0YWJzKS5mb3JFYWNoKCh0YWIpID0+IHtcbiAgICAgICAgICAgIGlmICh0YWIudXJsKSB7XG4gICAgICAgICAgICAgIGJsb2NrU2l0ZXMoXG4gICAgICAgICAgICAgICAgdGFiLmlkLFxuICAgICAgICAgICAgICAgIHRhYi51cmwsXG4gICAgICAgICAgICAgICAgaXNIdHRwcyxcbiAgICAgICAgICAgICAgICBzaXRlcyxcbiAgICAgICAgICAgICAgICBpc1doaXRlTGlzdGluZyxcbiAgICAgICAgICAgICAgICByZWRpcmVjdExpbmssXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RPcHRpb25cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSkoKTtcblxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGZ1bmN0aW9uICh0YWJJZCwgY2hhbmdlSW5mbykge1xuICBnZXRTdG9yYWdlKFwic2V0dGluZ3NcIiwgZnVuY3Rpb24gKGRhdGE6IGFueSkge1xuICAgIGNvbnN0IHtcbiAgICAgIGlzQmxvY2tpbmcsXG4gICAgICBpc1doaXRlTGlzdGluZyxcbiAgICAgIHNpdGVMaXN0LFxuICAgICAgd2hpdGVMaXN0U2l0ZXMsXG4gICAgICByZWRpcmVjdExpbmssXG4gICAgICByZWRpcmVjdE9wdGlvbixcbiAgICAgIGlzSHR0cHMsXG4gICAgfSA9IGRhdGEuc2V0dGluZ3M7XG4gICAgaWYgKChpc0Jsb2NraW5nIHx8IGlzV2hpdGVMaXN0aW5nKSAmJiBjaGFuZ2VJbmZvLnVybCkge1xuICAgICAgY29uc3Qgc2l0ZXMgPSBpc1doaXRlTGlzdGluZyA/IHdoaXRlTGlzdFNpdGVzIDogc2l0ZUxpc3Q7XG4gICAgICBibG9ja1NpdGVzKFxuICAgICAgICB0YWJJZCxcbiAgICAgICAgY2hhbmdlSW5mby51cmwsXG4gICAgICAgIGlzSHR0cHMsXG4gICAgICAgIHNpdGVzLFxuICAgICAgICBpc1doaXRlTGlzdGluZyxcbiAgICAgICAgcmVkaXJlY3RMaW5rLFxuICAgICAgICByZWRpcmVjdE9wdGlvblxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufSk7XG5cbmNocm9tZS5hbGFybXMub25BbGFybS5hZGRMaXN0ZW5lcigoKSA9PiB7XG4gIGdldFN0b3JhZ2UoXCJzZXR0aW5nc1wiLCAoZGF0YTogYW55KSA9PiB7XG4gICAgY29uc3QgeyBzZXR0aW5ncyB9ID0gZGF0YTtcbiAgICBzZXRTdG9yYWdlKFwic2V0dGluZ3NcIiwge1xuICAgICAgc2V0dGluZ3M6IHsgLi4uc2V0dGluZ3MsIHRpbWVyOiBudWxsLCBpc0Jsb2NraW5nOiBmYWxzZSwgaXNXaGl0ZUxpc3Rpbmc6IGZhbHNlIH0sXG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoY2hhbmdlcywgbmFtZXNwYWNlKSB7XG4gIGlmIChjaGFuZ2VzLnNldHRpbmdzKSB7XG4gICAgY29uc3QgeyBvbGRWYWx1ZSwgbmV3VmFsdWUgfSA9IGNoYW5nZXMuc2V0dGluZ3M7XG4gICAgaWYgKG9sZFZhbHVlICYmIG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGlzQmxvY2tpbmc6IG5Jc0Jsb2NraW5nLFxuICAgICAgICBzaXRlTGlzdDogblNpdGVMaXN0LFxuICAgICAgICBpc1doaXRlTGlzdGluZzogbklzV2hpdGVMaXN0aW5nLFxuICAgICAgICB3aGl0ZUxpc3RTaXRlczogbldoaXRlTGlzdFNpdGVzLFxuICAgICAgICByZWRpcmVjdExpbmssXG4gICAgICAgIHJlZGlyZWN0T3B0aW9uLFxuICAgICAgICB0aW1lcixcbiAgICAgICAgaXNIdHRwcyxcbiAgICAgIH0gPSBuZXdWYWx1ZTtcbiAgICAgIC8vIFRPRE8gaW4gZnV0dXJlIGNhbiBtYWtlIGl0IHBvc3NpYmxlIHRvIHR1cm4gb2ZmIGJsb2NrIHNpdGVzIGFuZCB0aGVuIGFueSBwYWdlIHdvdWxkIGdvIGJhY2sgdG8gd2hhdCB3YXMgb3JpZ2luYWxseSBzZWFyY2hlZCAoaWYgSSBzYXZlIHNlYXJjaGVkIHZpZCBwZXIgdGFiIHByaW9yIHRvIGJsb2NraW5nIHNhaWQgcGFnZSkuIGN1cnJlbnRseSBibG9ja2luZyBpdCBzZWVtcyB0byBvdmVyd3JpdGUgdGhlIHBhZ2UgaW4gaGlzdG9yeVxuICAgICAgY29uc3QgYmxvY2tpbmdXYXNEaXNhYmxlZCA9XG4gICAgICAgIChuSXNCbG9ja2luZyAhPT0gb2xkVmFsdWUuaXNCbG9ja2luZyAmJiAhbklzQmxvY2tpbmcpIHx8XG4gICAgICAgIChuSXNXaGl0ZUxpc3RpbmcgIT09IG9sZFZhbHVlLmlzV2hpdGVMaXN0aW5nICYmICFuSXNXaGl0ZUxpc3RpbmcpO1xuICAgICAgaWYgKHRpbWVyICYmIGJsb2NraW5nV2FzRGlzYWJsZWQpIHtcbiAgICAgICAgY2hyb21lLmFsYXJtcy5jbGVhckFsbCgpO1xuICAgICAgICBzZXRTdG9yYWdlKFwic2V0dGluZ3NcIiwgeyBzZXR0aW5nczogeyAuLi5uZXdWYWx1ZSwgdGltZXI6IG51bGwgfSB9KTtcbiAgICAgIH1cbiAgICAgIGlmICghdGltZXIgJiYgb2xkVmFsdWUudGltZXIpIGNocm9tZS5hbGFybXMuY2xlYXJBbGwoKTtcbiAgICAgIGlmICh0aW1lciAmJiB0aW1lciAhPT0gb2xkVmFsdWUudGltZXIpIHtcbiAgICAgICAgY2hyb21lLmFsYXJtcy5jbGVhckFsbCgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0ZWQgdGltZXJcIik7XG4gICAgICAgIGNocm9tZS5hbGFybXMuY3JlYXRlKHsgZGVsYXlJbk1pbnV0ZXM6IE1hdGgucm91bmQoKHRpbWVyIC0gRGF0ZS5ub3coKSkgLyAxMDAwIC8gNjApIH0pO1xuICAgICAgfVxuICAgICAgY29uc3QgYmxvY2tFbmFibGVkID0gbklzQmxvY2tpbmcgfHwgbklzV2hpdGVMaXN0aW5nO1xuICAgICAgaWYgKGJsb2NrRW5hYmxlZCkge1xuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgZnVuY3Rpb24gKHRhYnMpIHtcbiAgICAgICAgICBjb25zdCBzaXRlTGlzdCA9IG5Jc1doaXRlTGlzdGluZyA/IG5XaGl0ZUxpc3RTaXRlcyA6IG5TaXRlTGlzdDtcbiAgICAgICAgICBBcnJheS5mcm9tKHRhYnMpLmZvckVhY2goKHRhYikgPT4ge1xuICAgICAgICAgICAgaWYgKHRhYi51cmwpIHtcbiAgICAgICAgICAgICAgYmxvY2tTaXRlcyhcbiAgICAgICAgICAgICAgICB0YWIuaWQsXG4gICAgICAgICAgICAgICAgdGFiLnVybCxcbiAgICAgICAgICAgICAgICBpc0h0dHBzLFxuICAgICAgICAgICAgICAgIHNpdGVMaXN0LFxuICAgICAgICAgICAgICAgIG5Jc1doaXRlTGlzdGluZyxcbiAgICAgICAgICAgICAgICByZWRpcmVjdExpbmssXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RPcHRpb25cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxuLy8gbmV2ZXIgYmxvY2sgc2l0ZXMgd2l0aCB0aGVzZSB0ZXJtc1xuY29uc3QgaWdub3JlU2l0ZSA9ICh1cmw6IHN0cmluZykgPT4ge1xuICBjb25zdCBpZ25vcmVTaXRlcyA9IFtcImNocm9tZS1leHRlbnNpb246Ly9cIiwgXCJjaHJvbWU6XCJdO1xuICByZXR1cm4gaWdub3JlU2l0ZXMuc29tZSgoc2l0ZSkgPT4gdXJsLmluZGV4T2Yoc2l0ZSkgPT09IDApO1xufTtcblxuZnVuY3Rpb24gYmxvY2tTaXRlcyhcbiAgdGFiSWQ6IGFueSxcbiAgdXJsOiBzdHJpbmcsXG4gIGlzSHR0cHM6IGJvb2xlYW4sXG4gIHNpdGVMaXN0OiBzdHJpbmdbXSxcbiAgaXNXaGl0ZWxpc3QgPSBmYWxzZSxcbiAgcmVkaXJlY3RMaW5rOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIHJlZGlyZWN0T3B0aW9uID0gUmVkaXJlY3RFbnVtLkJMQU5LXG4pIHtcbiAgaWYgKGlnbm9yZVNpdGUodXJsKSkgcmV0dXJuO1xuICBjb25zdCBpc0luTGlzdCA9IHNpdGVMaXN0LmZpbmQoKHNpdGUpID0+IHtcbiAgICByZXR1cm4gdXJsLmluZGV4T2YoXCJodHRwczovL1wiICsgc2l0ZSkgPT09IDAgfHwgdXJsLmluZGV4T2YoXCJodHRwOi8vXCIgKyBzaXRlKSA9PT0gMDtcbiAgfSk7XG4gIGNvbnN0IHNob3VsZEJlQmxvY2tlZCA9IChpc0luTGlzdCAmJiAhaXNXaGl0ZWxpc3QpIHx8ICghaXNJbkxpc3QgJiYgaXNXaGl0ZWxpc3QpO1xuICBpZiAoc2hvdWxkQmVCbG9ja2VkKSB7XG4gICAgLy8gY2FuIEkgcHVzaCB0aGUgY3VycmVudCB1cmwgb250byBoaXN0b3J5IHNvIGl0IGlzbid0IGxvc3QgYmVmb3JlIHJlZGlyZWN0P1xuICAgIGNvbnN0IHVybCA9XG4gICAgICByZWRpcmVjdE9wdGlvbiA9PT0gUmVkaXJlY3RFbnVtLlVSTCAmJiByZWRpcmVjdExpbmtcbiAgICAgICAgPyAoaXNIdHRwcyA/IFwiaHR0cHM6Ly9cIiA6IFwiaHR0cDovL1wiKSArIHJlZGlyZWN0TGlua1xuICAgICAgICA6IFwibm90X2F2YWlsYWJsZS9ub3RfYXZhaWxhYmxlLmh0bWxcIjtcbiAgICBjaHJvbWUudGFicy51cGRhdGUodGFiSWQsIHsgdXJsIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVNldHRpbmdzKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICBjb25zdCBwcmV2U2V0dGluZ3MgPSBkYXRhLnNldHRpbmdzIHx8IHt9O1xuXG4gIGxldCB7XG4gICAgaXNCbG9ja2luZyxcbiAgICBzaXRlTGlzdCxcbiAgICBpc1doaXRlTGlzdGluZyxcbiAgICB3aGl0ZUxpc3RTaXRlcyxcbiAgICByZWRpcmVjdExpbmssXG4gICAgcmVkaXJlY3RPcHRpb24sXG4gICAgdGltZXIsXG4gICAgc2F2ZWRNaW51dGVzLFxuICAgIHNhdmVkSG91cnMsXG4gICAgaXNIdHRwcyxcbiAgfSA9IHByZXZTZXR0aW5ncztcblxuICBpc0Jsb2NraW5nID0gQm9vbGVhbihpc0Jsb2NraW5nKTtcbiAgaXNXaGl0ZUxpc3RpbmcgPSBCb29sZWFuKGlzV2hpdGVMaXN0aW5nKTtcbiAgc2l0ZUxpc3QgPSBzaXRlTGlzdCA9PT0gdW5kZWZpbmVkID8gW10gOiBzaXRlTGlzdDtcbiAgd2hpdGVMaXN0U2l0ZXMgPSB3aGl0ZUxpc3RTaXRlcyA9PT0gdW5kZWZpbmVkID8gW10gOiB3aGl0ZUxpc3RTaXRlcztcbiAgcmVkaXJlY3RMaW5rID0gcmVkaXJlY3RMaW5rIHx8IFwiXCI7XG4gIHJlZGlyZWN0T3B0aW9uID0gcmVkaXJlY3RPcHRpb24gfHwgUmVkaXJlY3RFbnVtLkRFRkFVTFQ7XG4gIHRpbWVyIHx8PSBudWxsO1xuICBzYXZlZE1pbnV0ZXMgfHw9IDA7XG4gIHNhdmVkSG91cnMgfHw9IDA7XG4gIGlzSHR0cHMgPSBpc0h0dHBzICE9PSBmYWxzZTtcbiAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgaXNCbG9ja2luZyxcbiAgICBzaXRlTGlzdCxcbiAgICBpc1doaXRlTGlzdGluZyxcbiAgICB3aGl0ZUxpc3RTaXRlcyxcbiAgICByZWRpcmVjdExpbmssXG4gICAgcmVkaXJlY3RPcHRpb24sXG4gICAgdGltZXIsXG4gICAgc2F2ZWRNaW51dGVzLFxuICAgIHNhdmVkSG91cnMsXG4gICAgaXNIdHRwcyxcbiAgfTtcbiAgLy91cGRhdGUgc3RvcmFnZSB1c2UgdG8gbmV3IHNldCBmdW5jdGlvblxuICBsZXQgbmV3RGF0YSA9IHt9O1xuICBzZXRTdG9yYWdlKFwic2V0dGluZ3NcIiwgeyBzZXR0aW5ncyB9KS50aGVuKChkYXRhKSA9PiB7XG4gICAgbmV3RGF0YSA9IE9iamVjdC5hc3NpZ24obmV3RGF0YSwgZGF0YSk7XG4gICAgY2FsbGJhY2sobmV3RGF0YSk7XG4gIH0pO1xufVxuIiwiZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2UgPSAoa2V5OiBzdHJpbmcsIGNhbGxiYWNrPzogYW55KSA9PiB7XG4gIGNvbnN0IHN0b3JhZ2UgPSBrZXkgPT09IFwic2V0dGluZ3NcIiA/IGNocm9tZS5zdG9yYWdlLnN5bmMgOiBjaHJvbWUuc3RvcmFnZS5sb2NhbDtcbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgc3RvcmFnZS5nZXQoa2V5LCAoZGF0YSkgPT4gcmVzb2x2ZShkYXRhKSk7XG4gIH0pO1xuICByZXR1cm4gY2FsbGJhY2sgPyBwcm9taXNlLnRoZW4oY2FsbGJhY2spIDogcHJvbWlzZTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRTdG9yYWdlID0gKGtleTogc3RyaW5nLCBvYmplY3Q6IGFueSwgY2FsbGJhY2s/OiBhbnkpID0+IHtcbiAgY29uc3Qgc3RvcmFnZSA9IGtleSA9PT0gXCJzZXR0aW5nc1wiID8gY2hyb21lLnN0b3JhZ2Uuc3luYyA6IGNocm9tZS5zdG9yYWdlLmxvY2FsO1xuICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzdG9yYWdlLnNldChvYmplY3QsICgpID0+IHtcbiAgICAgIHN0b3JhZ2UuZ2V0KGtleSwgKGRhdGEpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBjYWxsYmFjayA/IHByb21pc2UudGhlbihjYWxsYmFjaykgOiBwcm9taXNlO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2VBbGwgPSAoa2V5czogYW55LCBjYWxsYmFjaz86IGFueSkgPT4ge1xuICBjb25zdCBzdG9yYWdlc0tleXMgPSBrZXlzLm1hcCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4geyBrZXksIHN0b3JhZ2U6IGNocm9tZS5zdG9yYWdlW2tleSA9PT0gXCJzZXR0aW5nc1wiID8gXCJzeW5jXCIgOiBcImxvY2FsXCJdIH07XG4gIH0pO1xuICBjb25zdCBwcm9taXNlID0gUHJvbWlzZS5hbGwoXG4gICAgc3RvcmFnZXNLZXlzLm1hcCgoc3RvcmFnZUtleTogYW55KSA9PiB7XG4gICAgICBjb25zdCB7IHN0b3JhZ2UsIGtleSB9ID0gc3RvcmFnZUtleTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzdG9yYWdlLmdldChrZXksIChkYXRhOiBhbnkpID0+IHJlc29sdmUoZGF0YSkpO1xuICAgICAgfSk7XG4gICAgfSlcbiAgKS50aGVuKChyZXMpID0+IHtcbiAgICBjb25zdCBkYXRhID0ge30gYXMgYW55O1xuICAgIHJlcy5mb3JFYWNoKChpdGVtLCBpZHgpID0+IChkYXRhW2tleXNbaWR4XV0gPSBpdGVtW2tleXNbaWR4XV0pKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfSk7XG4gIHJldHVybiBjYWxsYmFjayA/IHByb21pc2UudGhlbihjYWxsYmFjaykgOiBwcm9taXNlO1xufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL2JhY2tncm91bmQvaW5kZXgudHNcIik7XG4iXSwic291cmNlUm9vdCI6IiJ9