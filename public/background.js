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
    RedirectEnum["WHIMSICAL"] = "WHIMSICAL";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QztJQUNILE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDckQsQ0FBQyxDQUFDO0FBakJXLHFCQUFhLGlCQWlCeEI7Ozs7Ozs7VUNyQ0Y7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2V5ZXNoYWRlLy4vYmFja2dyb3VuZC9pbmRleC50cyIsIndlYnBhY2s6Ly9leWVzaGFkZS8uL21vZHVsZXMvc3RvcmFnZS50cyIsIndlYnBhY2s6Ly9leWVzaGFkZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leWVzaGFkZS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2V5ZXNoYWRlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9leWVzaGFkZS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0U3RvcmFnZSwgc2V0U3RvcmFnZSwgZ2V0U3RvcmFnZUFsbCB9IGZyb20gXCIuLi9tb2R1bGVzL3N0b3JhZ2VcIjtcblxuZXhwb3J0IGVudW0gUmVkaXJlY3RFbnVtIHtcbiAgVVJMID0gXCJVUkxcIixcbiAgQkxBTksgPSBcIkJMQU5LXCIsXG4gIERFRkFVTFQgPSBcIkRFRkFVTFRcIixcbiAgRU5DT1VSQUdJTkcgPSBcIkVOQ09VUkFHSU5HXCIsXG4gIE9GRkVOU0lWRSA9IFwiT0ZGRU5TSVZFXCIsXG4gIFdISU1TSUNBTCA9IFwiV0hJTVNJQ0FMXCIsXG4gIENVU1RPTSA9IFwiQ1VTVE9NXCIsXG59XG5cbmV4cG9ydCB0eXBlIFRpcCA9IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgVGlwU2V0dGluZ3MgPSB7XG4gIHRpcHM6IFRpcFtdO1xuICB0aGVtZToge1xuICAgIGNvbG9yOiB7XG4gICAgICBiYWNrZ3JvdW5kU3RhcnQ6IHN0cmluZztcbiAgICAgIGJhY2tncm91bmRFbmQ6IHN0cmluZztcbiAgICAgIGZvbnRGYW1pbHk6IHN0cmluZztcbiAgICAgIGZvbnRDb2xvcjogc3RyaW5nO1xuICAgIH07XG4gIH07XG59O1xuXG5leHBvcnQgdHlwZSBTZXR0aW5ncyA9IHtcbiAgaXNCbG9ja2luZz86IGJvb2xlYW47XG4gIGlzV2hpdGVMaXN0aW5nPzogYm9vbGVhbjtcbiAgc2l0ZUxpc3Q/OiBzdHJpbmdbXTtcbiAgd2hpdGVMaXN0U2l0ZXM/OiBzdHJpbmdbXTtcbiAgcmVkaXJlY3RMaW5rPzogc3RyaW5nO1xuICByZWRpcmVjdE9wdGlvbj86IFJlZGlyZWN0RW51bTtcbiAgdGlwU2V0dGluZ3M/OiBUaXBTZXR0aW5ncztcbiAgdGltZXI/OiBudW1iZXIgfCBudWxsO1xuICBzYXZlZE1pbnV0ZXM6IG51bWJlcjtcbiAgc2F2ZWRIb3VyczogbnVtYmVyO1xuICBpc0h0dHBzOiBib29sZWFuO1xufTtcblxuKGZ1bmN0aW9uICgpIHtcbiAgZ2V0U3RvcmFnZUFsbChbXCJzZXR0aW5nc1wiXSkudGhlbigoZGF0YSkgPT4ge1xuICAgIGVuc3VyZVNldHRpbmdzKGRhdGEsIChuZXdEYXRhOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgaXNCbG9ja2luZyxcbiAgICAgICAgaXNXaGl0ZUxpc3RpbmcsXG4gICAgICAgIHNpdGVMaXN0LFxuICAgICAgICB3aGl0ZUxpc3RTaXRlcyxcbiAgICAgICAgcmVkaXJlY3RMaW5rLFxuICAgICAgICByZWRpcmVjdE9wdGlvbixcbiAgICAgICAgaXNIdHRwcyxcbiAgICAgIH0gPSBuZXdEYXRhLnNldHRpbmdzIGFzIFNldHRpbmdzO1xuICAgICAgaWYgKGlzQmxvY2tpbmcgfHwgaXNXaGl0ZUxpc3RpbmcpIHtcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe30sIGZ1bmN0aW9uICh0YWJzKSB7XG4gICAgICAgICAgY29uc3Qgc2l0ZXMgPSAoaXNXaGl0ZUxpc3RpbmcgPyB3aGl0ZUxpc3RTaXRlcyA6IHNpdGVMaXN0KSB8fCBbXTtcbiAgICAgICAgICBBcnJheS5mcm9tKHRhYnMpLmZvckVhY2goKHRhYikgPT4ge1xuICAgICAgICAgICAgaWYgKHRhYi51cmwpIHtcbiAgICAgICAgICAgICAgYmxvY2tTaXRlcyhcbiAgICAgICAgICAgICAgICB0YWIuaWQsXG4gICAgICAgICAgICAgICAgdGFiLnVybCxcbiAgICAgICAgICAgICAgICBpc0h0dHBzLFxuICAgICAgICAgICAgICAgIHNpdGVzLFxuICAgICAgICAgICAgICAgIGlzV2hpdGVMaXN0aW5nLFxuICAgICAgICAgICAgICAgIHJlZGlyZWN0TGluayxcbiAgICAgICAgICAgICAgICByZWRpcmVjdE9wdGlvblxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KSgpO1xuXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYklkLCBjaGFuZ2VJbmZvKSB7XG4gIGdldFN0b3JhZ2UoXCJzZXR0aW5nc1wiLCBmdW5jdGlvbiAoZGF0YTogYW55KSB7XG4gICAgY29uc3Qge1xuICAgICAgaXNCbG9ja2luZyxcbiAgICAgIGlzV2hpdGVMaXN0aW5nLFxuICAgICAgc2l0ZUxpc3QsXG4gICAgICB3aGl0ZUxpc3RTaXRlcyxcbiAgICAgIHJlZGlyZWN0TGluayxcbiAgICAgIHJlZGlyZWN0T3B0aW9uLFxuICAgICAgaXNIdHRwcyxcbiAgICB9ID0gZGF0YS5zZXR0aW5ncztcbiAgICBpZiAoKGlzQmxvY2tpbmcgfHwgaXNXaGl0ZUxpc3RpbmcpICYmIGNoYW5nZUluZm8udXJsKSB7XG4gICAgICBjb25zdCBzaXRlcyA9IGlzV2hpdGVMaXN0aW5nID8gd2hpdGVMaXN0U2l0ZXMgOiBzaXRlTGlzdDtcbiAgICAgIGJsb2NrU2l0ZXMoXG4gICAgICAgIHRhYklkLFxuICAgICAgICBjaGFuZ2VJbmZvLnVybCxcbiAgICAgICAgaXNIdHRwcyxcbiAgICAgICAgc2l0ZXMsXG4gICAgICAgIGlzV2hpdGVMaXN0aW5nLFxuICAgICAgICByZWRpcmVjdExpbmssXG4gICAgICAgIHJlZGlyZWN0T3B0aW9uXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG59KTtcblxuY2hyb21lLmFsYXJtcy5vbkFsYXJtLmFkZExpc3RlbmVyKCgpID0+IHtcbiAgZ2V0U3RvcmFnZShcInNldHRpbmdzXCIsIChkYXRhOiBhbnkpID0+IHtcbiAgICBjb25zdCB7IHNldHRpbmdzIH0gPSBkYXRhO1xuICAgIHNldFN0b3JhZ2UoXCJzZXR0aW5nc1wiLCB7XG4gICAgICBzZXR0aW5nczogeyAuLi5zZXR0aW5ncywgdGltZXI6IG51bGwsIGlzQmxvY2tpbmc6IGZhbHNlLCBpc1doaXRlTGlzdGluZzogZmFsc2UgfSxcbiAgICB9KTtcbiAgfSk7XG59KTtcblxuY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKGZ1bmN0aW9uIChjaGFuZ2VzLCBuYW1lc3BhY2UpIHtcbiAgaWYgKGNoYW5nZXMuc2V0dGluZ3MpIHtcbiAgICBjb25zdCB7IG9sZFZhbHVlLCBuZXdWYWx1ZSB9ID0gY2hhbmdlcy5zZXR0aW5ncztcbiAgICBpZiAob2xkVmFsdWUgJiYgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgaXNCbG9ja2luZzogbklzQmxvY2tpbmcsXG4gICAgICAgIHNpdGVMaXN0OiBuU2l0ZUxpc3QsXG4gICAgICAgIGlzV2hpdGVMaXN0aW5nOiBuSXNXaGl0ZUxpc3RpbmcsXG4gICAgICAgIHdoaXRlTGlzdFNpdGVzOiBuV2hpdGVMaXN0U2l0ZXMsXG4gICAgICAgIHJlZGlyZWN0TGluayxcbiAgICAgICAgcmVkaXJlY3RPcHRpb24sXG4gICAgICAgIHRpbWVyLFxuICAgICAgICBpc0h0dHBzLFxuICAgICAgfSA9IG5ld1ZhbHVlO1xuICAgICAgLy8gVE9ETyBpbiBmdXR1cmUgY2FuIG1ha2UgaXQgcG9zc2libGUgdG8gdHVybiBvZmYgYmxvY2sgc2l0ZXMgYW5kIHRoZW4gYW55IHBhZ2Ugd291bGQgZ28gYmFjayB0byB3aGF0IHdhcyBvcmlnaW5hbGx5IHNlYXJjaGVkIChpZiBJIHNhdmUgc2VhcmNoZWQgdmlkIHBlciB0YWIgcHJpb3IgdG8gYmxvY2tpbmcgc2FpZCBwYWdlKS4gY3VycmVudGx5IGJsb2NraW5nIGl0IHNlZW1zIHRvIG92ZXJ3cml0ZSB0aGUgcGFnZSBpbiBoaXN0b3J5XG4gICAgICBjb25zdCBibG9ja2luZ1dhc0Rpc2FibGVkID1cbiAgICAgICAgKG5Jc0Jsb2NraW5nICE9PSBvbGRWYWx1ZS5pc0Jsb2NraW5nICYmICFuSXNCbG9ja2luZykgfHxcbiAgICAgICAgKG5Jc1doaXRlTGlzdGluZyAhPT0gb2xkVmFsdWUuaXNXaGl0ZUxpc3RpbmcgJiYgIW5Jc1doaXRlTGlzdGluZyk7XG4gICAgICBpZiAodGltZXIgJiYgYmxvY2tpbmdXYXNEaXNhYmxlZCkge1xuICAgICAgICBjaHJvbWUuYWxhcm1zLmNsZWFyQWxsKCk7XG4gICAgICAgIHNldFN0b3JhZ2UoXCJzZXR0aW5nc1wiLCB7IHNldHRpbmdzOiB7IC4uLm5ld1ZhbHVlLCB0aW1lcjogbnVsbCB9IH0pO1xuICAgICAgfVxuICAgICAgaWYgKCF0aW1lciAmJiBvbGRWYWx1ZS50aW1lcikgY2hyb21lLmFsYXJtcy5jbGVhckFsbCgpO1xuICAgICAgaWYgKHRpbWVyICYmIHRpbWVyICE9PSBvbGRWYWx1ZS50aW1lcikge1xuICAgICAgICBjaHJvbWUuYWxhcm1zLmNsZWFyQWxsKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY3JlYXRlZCB0aW1lclwiKTtcbiAgICAgICAgY2hyb21lLmFsYXJtcy5jcmVhdGUoeyBkZWxheUluTWludXRlczogTWF0aC5yb3VuZCgodGltZXIgLSBEYXRlLm5vdygpKSAvIDEwMDAgLyA2MCkgfSk7XG4gICAgICB9XG4gICAgICBjb25zdCBibG9ja0VuYWJsZWQgPSBuSXNCbG9ja2luZyB8fCBuSXNXaGl0ZUxpc3Rpbmc7XG4gICAgICBpZiAoYmxvY2tFbmFibGVkKSB7XG4gICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCBmdW5jdGlvbiAodGFicykge1xuICAgICAgICAgIGNvbnN0IHNpdGVMaXN0ID0gbklzV2hpdGVMaXN0aW5nID8gbldoaXRlTGlzdFNpdGVzIDogblNpdGVMaXN0O1xuICAgICAgICAgIEFycmF5LmZyb20odGFicykuZm9yRWFjaCgodGFiKSA9PiB7XG4gICAgICAgICAgICBpZiAodGFiLnVybCkge1xuICAgICAgICAgICAgICBibG9ja1NpdGVzKFxuICAgICAgICAgICAgICAgIHRhYi5pZCxcbiAgICAgICAgICAgICAgICB0YWIudXJsLFxuICAgICAgICAgICAgICAgIGlzSHR0cHMsXG4gICAgICAgICAgICAgICAgc2l0ZUxpc3QsXG4gICAgICAgICAgICAgICAgbklzV2hpdGVMaXN0aW5nLFxuICAgICAgICAgICAgICAgIHJlZGlyZWN0TGluayxcbiAgICAgICAgICAgICAgICByZWRpcmVjdE9wdGlvblxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuXG4vLyBuZXZlciBibG9jayBzaXRlcyB3aXRoIHRoZXNlIHRlcm1zXG5jb25zdCBpZ25vcmVTaXRlID0gKHVybDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGlnbm9yZVNpdGVzID0gW1wiY2hyb21lLWV4dGVuc2lvbjovL1wiLCBcImNocm9tZTpcIl07XG4gIHJldHVybiBpZ25vcmVTaXRlcy5zb21lKChzaXRlKSA9PiB1cmwuaW5kZXhPZihzaXRlKSA9PT0gMCk7XG59O1xuXG5mdW5jdGlvbiBibG9ja1NpdGVzKFxuICB0YWJJZDogYW55LFxuICB1cmw6IHN0cmluZyxcbiAgaXNIdHRwczogYm9vbGVhbixcbiAgc2l0ZUxpc3Q6IHN0cmluZ1tdLFxuICBpc1doaXRlbGlzdCA9IGZhbHNlLFxuICByZWRpcmVjdExpbms6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgcmVkaXJlY3RPcHRpb24gPSBSZWRpcmVjdEVudW0uQkxBTktcbikge1xuICBpZiAoaWdub3JlU2l0ZSh1cmwpKSByZXR1cm47XG4gIGNvbnN0IGlzSW5MaXN0ID0gc2l0ZUxpc3QuZmluZCgoc2l0ZSkgPT4ge1xuICAgIHJldHVybiB1cmwuaW5kZXhPZihcImh0dHBzOi8vXCIgKyBzaXRlKSA9PT0gMCB8fCB1cmwuaW5kZXhPZihcImh0dHA6Ly9cIiArIHNpdGUpID09PSAwO1xuICB9KTtcbiAgY29uc3Qgc2hvdWxkQmVCbG9ja2VkID0gKGlzSW5MaXN0ICYmICFpc1doaXRlbGlzdCkgfHwgKCFpc0luTGlzdCAmJiBpc1doaXRlbGlzdCk7XG4gIGlmIChzaG91bGRCZUJsb2NrZWQpIHtcbiAgICAvLyBjYW4gSSBwdXNoIHRoZSBjdXJyZW50IHVybCBvbnRvIGhpc3Rvcnkgc28gaXQgaXNuJ3QgbG9zdCBiZWZvcmUgcmVkaXJlY3Q/XG4gICAgY29uc3QgdXJsID1cbiAgICAgIHJlZGlyZWN0T3B0aW9uID09PSBSZWRpcmVjdEVudW0uVVJMICYmIHJlZGlyZWN0TGlua1xuICAgICAgICA/IChpc0h0dHBzID8gXCJodHRwczovL1wiIDogXCJodHRwOi8vXCIpICsgcmVkaXJlY3RMaW5rXG4gICAgICAgIDogXCJub3RfYXZhaWxhYmxlL25vdF9hdmFpbGFibGUuaHRtbFwiO1xuICAgIGNocm9tZS50YWJzLnVwZGF0ZSh0YWJJZCwgeyB1cmwgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5zdXJlU2V0dGluZ3MoZGF0YTogYW55LCBjYWxsYmFjazogYW55KSB7XG4gIGNvbnN0IHByZXZTZXR0aW5ncyA9IGRhdGEuc2V0dGluZ3MgfHwge307XG5cbiAgbGV0IHtcbiAgICBpc0Jsb2NraW5nLFxuICAgIHNpdGVMaXN0LFxuICAgIGlzV2hpdGVMaXN0aW5nLFxuICAgIHdoaXRlTGlzdFNpdGVzLFxuICAgIHJlZGlyZWN0TGluayxcbiAgICByZWRpcmVjdE9wdGlvbixcbiAgICB0aW1lcixcbiAgICBzYXZlZE1pbnV0ZXMsXG4gICAgc2F2ZWRIb3VycyxcbiAgICBpc0h0dHBzLFxuICB9ID0gcHJldlNldHRpbmdzO1xuXG4gIGlzQmxvY2tpbmcgPSBCb29sZWFuKGlzQmxvY2tpbmcpO1xuICBpc1doaXRlTGlzdGluZyA9IEJvb2xlYW4oaXNXaGl0ZUxpc3RpbmcpO1xuICBzaXRlTGlzdCA9IHNpdGVMaXN0ID09PSB1bmRlZmluZWQgPyBbXSA6IHNpdGVMaXN0O1xuICB3aGl0ZUxpc3RTaXRlcyA9IHdoaXRlTGlzdFNpdGVzID09PSB1bmRlZmluZWQgPyBbXSA6IHdoaXRlTGlzdFNpdGVzO1xuICByZWRpcmVjdExpbmsgPSByZWRpcmVjdExpbmsgfHwgXCJcIjtcbiAgcmVkaXJlY3RPcHRpb24gPSByZWRpcmVjdE9wdGlvbiB8fCBSZWRpcmVjdEVudW0uREVGQVVMVDtcbiAgdGltZXIgfHw9IG51bGw7XG4gIHNhdmVkTWludXRlcyB8fD0gMDtcbiAgc2F2ZWRIb3VycyB8fD0gMDtcbiAgaXNIdHRwcyA9IGlzSHR0cHMgIT09IGZhbHNlO1xuICBjb25zdCBzZXR0aW5ncyA9IHtcbiAgICBpc0Jsb2NraW5nLFxuICAgIHNpdGVMaXN0LFxuICAgIGlzV2hpdGVMaXN0aW5nLFxuICAgIHdoaXRlTGlzdFNpdGVzLFxuICAgIHJlZGlyZWN0TGluayxcbiAgICByZWRpcmVjdE9wdGlvbixcbiAgICB0aW1lcixcbiAgICBzYXZlZE1pbnV0ZXMsXG4gICAgc2F2ZWRIb3VycyxcbiAgICBpc0h0dHBzLFxuICB9O1xuICAvL3VwZGF0ZSBzdG9yYWdlIHVzZSB0byBuZXcgc2V0IGZ1bmN0aW9uXG4gIGxldCBuZXdEYXRhID0ge307XG4gIHNldFN0b3JhZ2UoXCJzZXR0aW5nc1wiLCB7IHNldHRpbmdzIH0pLnRoZW4oKGRhdGEpID0+IHtcbiAgICBuZXdEYXRhID0gT2JqZWN0LmFzc2lnbihuZXdEYXRhLCBkYXRhKTtcbiAgICBjYWxsYmFjayhuZXdEYXRhKTtcbiAgfSk7XG59XG4iLCJleHBvcnQgY29uc3QgZ2V0U3RvcmFnZSA9IChrZXk6IHN0cmluZywgY2FsbGJhY2s/OiBhbnkpID0+IHtcbiAgY29uc3Qgc3RvcmFnZSA9IGtleSA9PT0gXCJzZXR0aW5nc1wiID8gY2hyb21lLnN0b3JhZ2Uuc3luYyA6IGNocm9tZS5zdG9yYWdlLmxvY2FsO1xuICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzdG9yYWdlLmdldChrZXksIChkYXRhKSA9PiByZXNvbHZlKGRhdGEpKTtcbiAgfSk7XG4gIHJldHVybiBjYWxsYmFjayA/IHByb21pc2UudGhlbihjYWxsYmFjaykgOiBwcm9taXNlO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFN0b3JhZ2UgPSAoa2V5OiBzdHJpbmcsIG9iamVjdDogYW55LCBjYWxsYmFjaz86IGFueSkgPT4ge1xuICBjb25zdCBzdG9yYWdlID0ga2V5ID09PSBcInNldHRpbmdzXCIgPyBjaHJvbWUuc3RvcmFnZS5zeW5jIDogY2hyb21lLnN0b3JhZ2UubG9jYWw7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHN0b3JhZ2Uuc2V0KG9iamVjdCwgKCkgPT4ge1xuICAgICAgc3RvcmFnZS5nZXQoa2V5LCAoZGF0YSkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShkYXRhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGNhbGxiYWNrID8gcHJvbWlzZS50aGVuKGNhbGxiYWNrKSA6IHByb21pc2U7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U3RvcmFnZUFsbCA9IChrZXlzOiBhbnksIGNhbGxiYWNrPzogYW55KSA9PiB7XG4gIGNvbnN0IHN0b3JhZ2VzS2V5cyA9IGtleXMubWFwKChrZXk6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB7IGtleSwgc3RvcmFnZTogY2hyb21lLnN0b3JhZ2Vba2V5ID09PSBcInNldHRpbmdzXCIgPyBcInN5bmNcIiA6IFwibG9jYWxcIl0gfTtcbiAgfSk7XG4gIGNvbnN0IHByb21pc2UgPSBQcm9taXNlLmFsbChcbiAgICBzdG9yYWdlc0tleXMubWFwKChzdG9yYWdlS2V5OiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHsgc3RvcmFnZSwga2V5IH0gPSBzdG9yYWdlS2V5O1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIHN0b3JhZ2UuZ2V0KGtleSwgKGRhdGE6IGFueSkgPT4gcmVzb2x2ZShkYXRhKSk7XG4gICAgICB9KTtcbiAgICB9KVxuICApLnRoZW4oKHJlcykgPT4ge1xuICAgIGNvbnN0IGRhdGEgPSB7fSBhcyBhbnk7XG4gICAgcmVzLmZvckVhY2goKGl0ZW0sIGlkeCkgPT4gKGRhdGFba2V5c1tpZHhdXSA9IGl0ZW1ba2V5c1tpZHhdXSkpO1xuICAgIHJldHVybiBkYXRhO1xuICB9KTtcbiAgcmV0dXJuIGNhbGxiYWNrID8gcHJvbWlzZS50aGVuKGNhbGxiYWNrKSA6IHByb21pc2U7XG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vYmFja2dyb3VuZC9pbmRleC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==