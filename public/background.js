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
            const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption, isHttps, turnedOffBlockListSites, turnedOffWhiteListSites, } = newData.settings;
            if (isBlocking || isWhiteListing) {
                chrome.tabs.query({}, function (tabs) {
                    const sites = (isWhiteListing ? whiteListSites : siteList) || [];
                    const filteringSites = (isWhiteListing ? turnedOffWhiteListSites : turnedOffBlockListSites) || [];
                    const filteredSites = sites.filter((site) => !filteringSites.includes(site));
                    Array.from(tabs).forEach((tab) => {
                        if (tab.url) {
                            blockSites(tab.id, tab.url, isHttps, filteredSites, isWhiteListing, redirectLink, redirectOption);
                        }
                    });
                });
            }
        });
    });
})();
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    (0, storage_1.getStorage)("settings", function (data) {
        const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption, isHttps, turnedOffBlockListSites, turnedOffWhiteListSites, } = data.settings;
        if ((isBlocking || isWhiteListing) && changeInfo.url) {
            const sites = (isWhiteListing ? whiteListSites : siteList) || [];
            const filteringSites = (isWhiteListing ? turnedOffWhiteListSites : turnedOffBlockListSites) || [];
            const filteredSites = sites.filter((site) => !filteringSites.includes(site));
            blockSites(tabId, changeInfo.url, isHttps, filteredSites, isWhiteListing, redirectLink, redirectOption);
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
            const { isBlocking: nIsBlocking, siteList: nSiteList, isWhiteListing: nIsWhiteListing, whiteListSites: nWhiteListSites, redirectLink, redirectOption, timer, isHttps, turnedOffBlockListSites, turnedOffWhiteListSites, } = newValue;
            // TODO in future can make it possible to turn off block sites and then any page would go back to what was originally searched (if I save searched vid per tab prior to blocking said page). currently blocking it seems to overwrite the page in history
            const blockingWasDisabled = (nIsBlocking !== oldValue.isBlocking && !nIsBlocking) ||
                (nIsWhiteListing !== oldValue.isWhiteListing && !nIsWhiteListing);
            if (timer && blockingWasDisabled) {
                chrome.alarms.clearAll();
                setTimeout(() => {
                    const newSettings = { settings: Object.assign(Object.assign({}, newValue), { timer: null }) };
                    (0, storage_1.setStorage)("settings", newSettings);
                }, 10);
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
                    const siteList = (nIsWhiteListing ? nWhiteListSites : nSiteList) || [];
                    const filteringSites = (nIsWhiteListing ? turnedOffWhiteListSites : turnedOffBlockListSites) || [];
                    const filteredSites = siteList.filter((site) => !filteringSites.includes(site));
                    Array.from(tabs).forEach((tab) => {
                        if (tab.url) {
                            blockSites(tab.id, tab.url, isHttps, filteredSites, nIsWhiteListing, redirectLink, redirectOption);
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
    let { isBlocking, siteList, isWhiteListing, whiteListSites, redirectLink, redirectOption, timer, savedMinutes, savedHours, isHttps, turnedOffBlockListSites, turnedOffWhiteListSites, } = prevSettings;
    isBlocking = Boolean(isBlocking);
    isWhiteListing = Boolean(isWhiteListing);
    siteList !== null && siteList !== void 0 ? siteList : (siteList = []);
    whiteListSites !== null && whiteListSites !== void 0 ? whiteListSites : (whiteListSites = []);
    redirectLink = redirectLink || "";
    redirectOption = redirectOption || RedirectEnum.DEFAULT;
    timer || (timer = null);
    savedMinutes || (savedMinutes = 0);
    savedHours || (savedHours = 0);
    isHttps = isHttps !== false;
    turnedOffBlockListSites !== null && turnedOffBlockListSites !== void 0 ? turnedOffBlockListSites : (turnedOffBlockListSites = []);
    turnedOffWhiteListSites !== null && turnedOffWhiteListSites !== void 0 ? turnedOffWhiteListSites : (turnedOffWhiteListSites = []);
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
        turnedOffBlockListSites,
        turnedOffWhiteListSites,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRSxPQUFPLElBQUksQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNyRCxDQUFDLENBQUM7QUFqQlcscUJBQWEsaUJBaUJ4Qjs7Ozs7OztVQ3JDRjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXllc2hhZGUvLi9iYWNrZ3JvdW5kL2luZGV4LnRzIiwid2VicGFjazovL2V5ZXNoYWRlLy4vbW9kdWxlcy9zdG9yYWdlLnRzIiwid2VicGFjazovL2V5ZXNoYWRlL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V5ZXNoYWRlL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2V5ZXNoYWRlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRTdG9yYWdlLCBzZXRTdG9yYWdlLCBnZXRTdG9yYWdlQWxsIH0gZnJvbSBcIi4uL21vZHVsZXMvc3RvcmFnZVwiO1xuXG5leHBvcnQgZW51bSBSZWRpcmVjdEVudW0ge1xuICBVUkwgPSBcIlVSTFwiLFxuICBCTEFOSyA9IFwiQkxBTktcIixcbiAgREVGQVVMVCA9IFwiREVGQVVMVFwiLFxuICBFTkNPVVJBR0lORyA9IFwiRU5DT1VSQUdJTkdcIixcbiAgT0ZGRU5TSVZFID0gXCJPRkZFTlNJVkVcIixcbiAgQ1VTVE9NID0gXCJDVVNUT01cIixcbn1cblxuZXhwb3J0IHR5cGUgVGlwID0ge1xuICB0aXRsZTogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBUaXBTZXR0aW5ncyA9IHtcbiAgdGlwczogVGlwW107XG4gIHRoZW1lOiB7XG4gICAgY29sb3I6IHtcbiAgICAgIGJhY2tncm91bmRTdGFydDogc3RyaW5nO1xuICAgICAgYmFja2dyb3VuZEVuZDogc3RyaW5nO1xuICAgICAgZm9udEZhbWlseTogc3RyaW5nO1xuICAgICAgZm9udENvbG9yOiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbn07XG5cbmV4cG9ydCB0eXBlIFNldHRpbmdzID0ge1xuICBpc0Jsb2NraW5nPzogYm9vbGVhbjtcbiAgaXNXaGl0ZUxpc3Rpbmc/OiBib29sZWFuO1xuICBzaXRlTGlzdD86IHN0cmluZ1tdO1xuICB3aGl0ZUxpc3RTaXRlcz86IHN0cmluZ1tdO1xuICByZWRpcmVjdExpbms/OiBzdHJpbmc7XG4gIHJlZGlyZWN0T3B0aW9uPzogUmVkaXJlY3RFbnVtO1xuICB0aXBTZXR0aW5ncz86IFRpcFNldHRpbmdzO1xuICB0aW1lcj86IG51bWJlciB8IG51bGw7XG4gIHNhdmVkTWludXRlczogbnVtYmVyO1xuICBzYXZlZEhvdXJzOiBudW1iZXI7XG4gIGlzSHR0cHM6IGJvb2xlYW47XG4gIHR1cm5lZE9mZkJsb2NrTGlzdFNpdGVzOiBzdHJpbmdbXTtcbiAgdHVybmVkT2ZmV2hpdGVMaXN0U2l0ZXM6IHN0cmluZ1tdO1xufTtcblxuKGZ1bmN0aW9uICgpIHtcbiAgZ2V0U3RvcmFnZUFsbChbXCJzZXR0aW5nc1wiXSkudGhlbigoZGF0YSkgPT4ge1xuICAgIGVuc3VyZVNldHRpbmdzKGRhdGEsIChuZXdEYXRhOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgaXNCbG9ja2luZyxcbiAgICAgICAgaXNXaGl0ZUxpc3RpbmcsXG4gICAgICAgIHNpdGVMaXN0LFxuICAgICAgICB3aGl0ZUxpc3RTaXRlcyxcbiAgICAgICAgcmVkaXJlY3RMaW5rLFxuICAgICAgICByZWRpcmVjdE9wdGlvbixcbiAgICAgICAgaXNIdHRwcyxcbiAgICAgICAgdHVybmVkT2ZmQmxvY2tMaXN0U2l0ZXMsXG4gICAgICAgIHR1cm5lZE9mZldoaXRlTGlzdFNpdGVzLFxuICAgICAgfSA9IG5ld0RhdGEuc2V0dGluZ3MgYXMgU2V0dGluZ3M7XG4gICAgICBpZiAoaXNCbG9ja2luZyB8fCBpc1doaXRlTGlzdGluZykge1xuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgZnVuY3Rpb24gKHRhYnMpIHtcbiAgICAgICAgICBjb25zdCBzaXRlcyA9IChpc1doaXRlTGlzdGluZyA/IHdoaXRlTGlzdFNpdGVzIDogc2l0ZUxpc3QpIHx8IFtdO1xuICAgICAgICAgIGNvbnN0IGZpbHRlcmluZ1NpdGVzID1cbiAgICAgICAgICAgIChpc1doaXRlTGlzdGluZyA/IHR1cm5lZE9mZldoaXRlTGlzdFNpdGVzIDogdHVybmVkT2ZmQmxvY2tMaXN0U2l0ZXMpIHx8IFtdO1xuICAgICAgICAgIGNvbnN0IGZpbHRlcmVkU2l0ZXMgPSBzaXRlcy5maWx0ZXIoKHNpdGUpID0+ICFmaWx0ZXJpbmdTaXRlcy5pbmNsdWRlcyhzaXRlKSk7XG4gICAgICAgICAgQXJyYXkuZnJvbSh0YWJzKS5mb3JFYWNoKCh0YWIpID0+IHtcbiAgICAgICAgICAgIGlmICh0YWIudXJsKSB7XG4gICAgICAgICAgICAgIGJsb2NrU2l0ZXMoXG4gICAgICAgICAgICAgICAgdGFiLmlkLFxuICAgICAgICAgICAgICAgIHRhYi51cmwsXG4gICAgICAgICAgICAgICAgaXNIdHRwcyxcbiAgICAgICAgICAgICAgICBmaWx0ZXJlZFNpdGVzLFxuICAgICAgICAgICAgICAgIGlzV2hpdGVMaXN0aW5nLFxuICAgICAgICAgICAgICAgIHJlZGlyZWN0TGluayxcbiAgICAgICAgICAgICAgICByZWRpcmVjdE9wdGlvblxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KSgpO1xuXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYklkLCBjaGFuZ2VJbmZvKSB7XG4gIGdldFN0b3JhZ2UoXCJzZXR0aW5nc1wiLCBmdW5jdGlvbiAoZGF0YTogYW55KSB7XG4gICAgY29uc3Qge1xuICAgICAgaXNCbG9ja2luZyxcbiAgICAgIGlzV2hpdGVMaXN0aW5nLFxuICAgICAgc2l0ZUxpc3QsXG4gICAgICB3aGl0ZUxpc3RTaXRlcyxcbiAgICAgIHJlZGlyZWN0TGluayxcbiAgICAgIHJlZGlyZWN0T3B0aW9uLFxuICAgICAgaXNIdHRwcyxcbiAgICAgIHR1cm5lZE9mZkJsb2NrTGlzdFNpdGVzLFxuICAgICAgdHVybmVkT2ZmV2hpdGVMaXN0U2l0ZXMsXG4gICAgfSA9IGRhdGEuc2V0dGluZ3MgYXMgU2V0dGluZ3M7XG4gICAgaWYgKChpc0Jsb2NraW5nIHx8IGlzV2hpdGVMaXN0aW5nKSAmJiBjaGFuZ2VJbmZvLnVybCkge1xuICAgICAgY29uc3Qgc2l0ZXMgPSAoaXNXaGl0ZUxpc3RpbmcgPyB3aGl0ZUxpc3RTaXRlcyA6IHNpdGVMaXN0KSB8fCBbXTtcbiAgICAgIGNvbnN0IGZpbHRlcmluZ1NpdGVzID1cbiAgICAgICAgKGlzV2hpdGVMaXN0aW5nID8gdHVybmVkT2ZmV2hpdGVMaXN0U2l0ZXMgOiB0dXJuZWRPZmZCbG9ja0xpc3RTaXRlcykgfHwgW107XG4gICAgICBjb25zdCBmaWx0ZXJlZFNpdGVzID0gc2l0ZXMuZmlsdGVyKChzaXRlKSA9PiAhZmlsdGVyaW5nU2l0ZXMuaW5jbHVkZXMoc2l0ZSkpO1xuICAgICAgYmxvY2tTaXRlcyhcbiAgICAgICAgdGFiSWQsXG4gICAgICAgIGNoYW5nZUluZm8udXJsLFxuICAgICAgICBpc0h0dHBzLFxuICAgICAgICBmaWx0ZXJlZFNpdGVzLFxuICAgICAgICBpc1doaXRlTGlzdGluZyxcbiAgICAgICAgcmVkaXJlY3RMaW5rLFxuICAgICAgICByZWRpcmVjdE9wdGlvblxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xufSk7XG5cbmNocm9tZS5hbGFybXMub25BbGFybS5hZGRMaXN0ZW5lcigoKSA9PiB7XG4gIGdldFN0b3JhZ2UoXCJzZXR0aW5nc1wiLCAoZGF0YTogYW55KSA9PiB7XG4gICAgY29uc3QgeyBzZXR0aW5ncyB9ID0gZGF0YTtcbiAgICBzZXRTdG9yYWdlKFwic2V0dGluZ3NcIiwge1xuICAgICAgc2V0dGluZ3M6IHsgLi4uc2V0dGluZ3MsIHRpbWVyOiBudWxsLCBpc0Jsb2NraW5nOiBmYWxzZSwgaXNXaGl0ZUxpc3Rpbmc6IGZhbHNlIH0sXG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoY2hhbmdlcywgbmFtZXNwYWNlKSB7XG4gIGlmIChjaGFuZ2VzLnNldHRpbmdzKSB7XG4gICAgY29uc3QgeyBvbGRWYWx1ZSwgbmV3VmFsdWUgfSA9IGNoYW5nZXMuc2V0dGluZ3M7XG4gICAgaWYgKG9sZFZhbHVlICYmIG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGlzQmxvY2tpbmc6IG5Jc0Jsb2NraW5nLFxuICAgICAgICBzaXRlTGlzdDogblNpdGVMaXN0LFxuICAgICAgICBpc1doaXRlTGlzdGluZzogbklzV2hpdGVMaXN0aW5nLFxuICAgICAgICB3aGl0ZUxpc3RTaXRlczogbldoaXRlTGlzdFNpdGVzLFxuICAgICAgICByZWRpcmVjdExpbmssXG4gICAgICAgIHJlZGlyZWN0T3B0aW9uLFxuICAgICAgICB0aW1lcixcbiAgICAgICAgaXNIdHRwcyxcbiAgICAgICAgdHVybmVkT2ZmQmxvY2tMaXN0U2l0ZXMsXG4gICAgICAgIHR1cm5lZE9mZldoaXRlTGlzdFNpdGVzLFxuICAgICAgfSA9IG5ld1ZhbHVlIGFzIFNldHRpbmdzO1xuICAgICAgLy8gVE9ETyBpbiBmdXR1cmUgY2FuIG1ha2UgaXQgcG9zc2libGUgdG8gdHVybiBvZmYgYmxvY2sgc2l0ZXMgYW5kIHRoZW4gYW55IHBhZ2Ugd291bGQgZ28gYmFjayB0byB3aGF0IHdhcyBvcmlnaW5hbGx5IHNlYXJjaGVkIChpZiBJIHNhdmUgc2VhcmNoZWQgdmlkIHBlciB0YWIgcHJpb3IgdG8gYmxvY2tpbmcgc2FpZCBwYWdlKS4gY3VycmVudGx5IGJsb2NraW5nIGl0IHNlZW1zIHRvIG92ZXJ3cml0ZSB0aGUgcGFnZSBpbiBoaXN0b3J5XG4gICAgICBjb25zdCBibG9ja2luZ1dhc0Rpc2FibGVkID1cbiAgICAgICAgKG5Jc0Jsb2NraW5nICE9PSBvbGRWYWx1ZS5pc0Jsb2NraW5nICYmICFuSXNCbG9ja2luZykgfHxcbiAgICAgICAgKG5Jc1doaXRlTGlzdGluZyAhPT0gb2xkVmFsdWUuaXNXaGl0ZUxpc3RpbmcgJiYgIW5Jc1doaXRlTGlzdGluZyk7XG4gICAgICBpZiAodGltZXIgJiYgYmxvY2tpbmdXYXNEaXNhYmxlZCkge1xuICAgICAgICBjaHJvbWUuYWxhcm1zLmNsZWFyQWxsKCk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5ld1NldHRpbmdzID0geyBzZXR0aW5nczogeyAuLi5uZXdWYWx1ZSwgdGltZXI6IG51bGwgfSB9O1xuICAgICAgICAgIHNldFN0b3JhZ2UoXCJzZXR0aW5nc1wiLCBuZXdTZXR0aW5ncyk7XG4gICAgICAgIH0sIDEwKTtcbiAgICAgIH1cbiAgICAgIGlmICghdGltZXIgJiYgb2xkVmFsdWUudGltZXIpIGNocm9tZS5hbGFybXMuY2xlYXJBbGwoKTtcbiAgICAgIGlmICh0aW1lciAmJiB0aW1lciAhPT0gb2xkVmFsdWUudGltZXIpIHtcbiAgICAgICAgY2hyb21lLmFsYXJtcy5jbGVhckFsbCgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0ZWQgdGltZXJcIik7XG4gICAgICAgIGNocm9tZS5hbGFybXMuY3JlYXRlKHsgZGVsYXlJbk1pbnV0ZXM6IE1hdGgucm91bmQoKHRpbWVyIC0gRGF0ZS5ub3coKSkgLyAxMDAwIC8gNjApIH0pO1xuICAgICAgfVxuICAgICAgY29uc3QgYmxvY2tFbmFibGVkID0gbklzQmxvY2tpbmcgfHwgbklzV2hpdGVMaXN0aW5nO1xuICAgICAgaWYgKGJsb2NrRW5hYmxlZCkge1xuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgZnVuY3Rpb24gKHRhYnMpIHtcbiAgICAgICAgICBjb25zdCBzaXRlTGlzdCA9IChuSXNXaGl0ZUxpc3RpbmcgPyBuV2hpdGVMaXN0U2l0ZXMgOiBuU2l0ZUxpc3QpIHx8IFtdO1xuICAgICAgICAgIGNvbnN0IGZpbHRlcmluZ1NpdGVzID1cbiAgICAgICAgICAgIChuSXNXaGl0ZUxpc3RpbmcgPyB0dXJuZWRPZmZXaGl0ZUxpc3RTaXRlcyA6IHR1cm5lZE9mZkJsb2NrTGlzdFNpdGVzKSB8fCBbXTtcbiAgICAgICAgICBjb25zdCBmaWx0ZXJlZFNpdGVzID0gc2l0ZUxpc3QuZmlsdGVyKChzaXRlKSA9PiAhZmlsdGVyaW5nU2l0ZXMuaW5jbHVkZXMoc2l0ZSkpO1xuICAgICAgICAgIEFycmF5LmZyb20odGFicykuZm9yRWFjaCgodGFiKSA9PiB7XG4gICAgICAgICAgICBpZiAodGFiLnVybCkge1xuICAgICAgICAgICAgICBibG9ja1NpdGVzKFxuICAgICAgICAgICAgICAgIHRhYi5pZCxcbiAgICAgICAgICAgICAgICB0YWIudXJsLFxuICAgICAgICAgICAgICAgIGlzSHR0cHMsXG4gICAgICAgICAgICAgICAgZmlsdGVyZWRTaXRlcyxcbiAgICAgICAgICAgICAgICBuSXNXaGl0ZUxpc3RpbmcsXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RMaW5rLFxuICAgICAgICAgICAgICAgIHJlZGlyZWN0T3B0aW9uXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cbi8vIG5ldmVyIGJsb2NrIHNpdGVzIHdpdGggdGhlc2UgdGVybXNcbmNvbnN0IGlnbm9yZVNpdGUgPSAodXJsOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgaWdub3JlU2l0ZXMgPSBbXCJjaHJvbWUtZXh0ZW5zaW9uOi8vXCIsIFwiY2hyb21lOlwiXTtcbiAgcmV0dXJuIGlnbm9yZVNpdGVzLnNvbWUoKHNpdGUpID0+IHVybC5pbmRleE9mKHNpdGUpID09PSAwKTtcbn07XG5cbmZ1bmN0aW9uIGJsb2NrU2l0ZXMoXG4gIHRhYklkOiBhbnksXG4gIHVybDogc3RyaW5nLFxuICBpc0h0dHBzOiBib29sZWFuLFxuICBzaXRlTGlzdDogc3RyaW5nW10sXG4gIGlzV2hpdGVsaXN0ID0gZmFsc2UsXG4gIHJlZGlyZWN0TGluazogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICByZWRpcmVjdE9wdGlvbiA9IFJlZGlyZWN0RW51bS5CTEFOS1xuKSB7XG4gIGlmIChpZ25vcmVTaXRlKHVybCkpIHJldHVybjtcbiAgY29uc3QgaXNJbkxpc3QgPSBzaXRlTGlzdC5maW5kKChzaXRlKSA9PiB7XG4gICAgcmV0dXJuIHVybC5pbmRleE9mKFwiaHR0cHM6Ly9cIiArIHNpdGUpID09PSAwIHx8IHVybC5pbmRleE9mKFwiaHR0cDovL1wiICsgc2l0ZSkgPT09IDA7XG4gIH0pO1xuICBjb25zdCBzaG91bGRCZUJsb2NrZWQgPSAoaXNJbkxpc3QgJiYgIWlzV2hpdGVsaXN0KSB8fCAoIWlzSW5MaXN0ICYmIGlzV2hpdGVsaXN0KTtcbiAgaWYgKHNob3VsZEJlQmxvY2tlZCkge1xuICAgIC8vIGNhbiBJIHB1c2ggdGhlIGN1cnJlbnQgdXJsIG9udG8gaGlzdG9yeSBzbyBpdCBpc24ndCBsb3N0IGJlZm9yZSByZWRpcmVjdD9cbiAgICBjb25zdCB1cmwgPVxuICAgICAgcmVkaXJlY3RPcHRpb24gPT09IFJlZGlyZWN0RW51bS5VUkwgJiYgcmVkaXJlY3RMaW5rXG4gICAgICAgID8gKGlzSHR0cHMgPyBcImh0dHBzOi8vXCIgOiBcImh0dHA6Ly9cIikgKyByZWRpcmVjdExpbmtcbiAgICAgICAgOiBcIm5vdF9hdmFpbGFibGUvbm90X2F2YWlsYWJsZS5odG1sXCI7XG4gICAgY2hyb21lLnRhYnMudXBkYXRlKHRhYklkLCB7IHVybCB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbnN1cmVTZXR0aW5ncyhkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgY29uc3QgcHJldlNldHRpbmdzID0gZGF0YS5zZXR0aW5ncyB8fCB7fTtcblxuICBsZXQge1xuICAgIGlzQmxvY2tpbmcsXG4gICAgc2l0ZUxpc3QsXG4gICAgaXNXaGl0ZUxpc3RpbmcsXG4gICAgd2hpdGVMaXN0U2l0ZXMsXG4gICAgcmVkaXJlY3RMaW5rLFxuICAgIHJlZGlyZWN0T3B0aW9uLFxuICAgIHRpbWVyLFxuICAgIHNhdmVkTWludXRlcyxcbiAgICBzYXZlZEhvdXJzLFxuICAgIGlzSHR0cHMsXG4gICAgdHVybmVkT2ZmQmxvY2tMaXN0U2l0ZXMsXG4gICAgdHVybmVkT2ZmV2hpdGVMaXN0U2l0ZXMsXG4gIH0gPSBwcmV2U2V0dGluZ3M7XG5cbiAgaXNCbG9ja2luZyA9IEJvb2xlYW4oaXNCbG9ja2luZyk7XG4gIGlzV2hpdGVMaXN0aW5nID0gQm9vbGVhbihpc1doaXRlTGlzdGluZyk7XG4gIHNpdGVMaXN0ID8/PSBbXTtcbiAgd2hpdGVMaXN0U2l0ZXMgPz89IFtdO1xuICByZWRpcmVjdExpbmsgPSByZWRpcmVjdExpbmsgfHwgXCJcIjtcbiAgcmVkaXJlY3RPcHRpb24gPSByZWRpcmVjdE9wdGlvbiB8fCBSZWRpcmVjdEVudW0uREVGQVVMVDtcbiAgdGltZXIgfHw9IG51bGw7XG4gIHNhdmVkTWludXRlcyB8fD0gMDtcbiAgc2F2ZWRIb3VycyB8fD0gMDtcbiAgaXNIdHRwcyA9IGlzSHR0cHMgIT09IGZhbHNlO1xuICB0dXJuZWRPZmZCbG9ja0xpc3RTaXRlcyA/Pz0gW107XG4gIHR1cm5lZE9mZldoaXRlTGlzdFNpdGVzID8/PSBbXTtcbiAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgaXNCbG9ja2luZyxcbiAgICBzaXRlTGlzdCxcbiAgICBpc1doaXRlTGlzdGluZyxcbiAgICB3aGl0ZUxpc3RTaXRlcyxcbiAgICByZWRpcmVjdExpbmssXG4gICAgcmVkaXJlY3RPcHRpb24sXG4gICAgdGltZXIsXG4gICAgc2F2ZWRNaW51dGVzLFxuICAgIHNhdmVkSG91cnMsXG4gICAgaXNIdHRwcyxcbiAgICB0dXJuZWRPZmZCbG9ja0xpc3RTaXRlcyxcbiAgICB0dXJuZWRPZmZXaGl0ZUxpc3RTaXRlcyxcbiAgfTtcbiAgLy91cGRhdGUgc3RvcmFnZSB1c2UgdG8gbmV3IHNldCBmdW5jdGlvblxuICBsZXQgbmV3RGF0YSA9IHt9O1xuICBzZXRTdG9yYWdlKFwic2V0dGluZ3NcIiwgeyBzZXR0aW5ncyB9KS50aGVuKChkYXRhKSA9PiB7XG4gICAgbmV3RGF0YSA9IE9iamVjdC5hc3NpZ24obmV3RGF0YSwgZGF0YSk7XG4gICAgY2FsbGJhY2sobmV3RGF0YSk7XG4gIH0pO1xufVxuIiwiZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2UgPSAoa2V5OiBzdHJpbmcsIGNhbGxiYWNrPzogYW55KSA9PiB7XG4gIGNvbnN0IHN0b3JhZ2UgPSBrZXkgPT09IFwic2V0dGluZ3NcIiA/IGNocm9tZS5zdG9yYWdlLnN5bmMgOiBjaHJvbWUuc3RvcmFnZS5sb2NhbDtcbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgc3RvcmFnZS5nZXQoa2V5LCAoZGF0YSkgPT4gcmVzb2x2ZShkYXRhKSk7XG4gIH0pO1xuICByZXR1cm4gY2FsbGJhY2sgPyBwcm9taXNlLnRoZW4oY2FsbGJhY2spIDogcHJvbWlzZTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXRTdG9yYWdlID0gKGtleTogc3RyaW5nLCBvYmplY3Q6IGFueSwgY2FsbGJhY2s/OiBhbnkpID0+IHtcbiAgY29uc3Qgc3RvcmFnZSA9IGtleSA9PT0gXCJzZXR0aW5nc1wiID8gY2hyb21lLnN0b3JhZ2Uuc3luYyA6IGNocm9tZS5zdG9yYWdlLmxvY2FsO1xuICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzdG9yYWdlLnNldChvYmplY3QsICgpID0+IHtcbiAgICAgIHN0b3JhZ2UuZ2V0KGtleSwgKGRhdGEpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBjYWxsYmFjayA/IHByb21pc2UudGhlbihjYWxsYmFjaykgOiBwcm9taXNlO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2VBbGwgPSAoa2V5czogYW55LCBjYWxsYmFjaz86IGFueSkgPT4ge1xuICBjb25zdCBzdG9yYWdlc0tleXMgPSBrZXlzLm1hcCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4geyBrZXksIHN0b3JhZ2U6IGNocm9tZS5zdG9yYWdlW2tleSA9PT0gXCJzZXR0aW5nc1wiID8gXCJzeW5jXCIgOiBcImxvY2FsXCJdIH07XG4gIH0pO1xuICBjb25zdCBwcm9taXNlID0gUHJvbWlzZS5hbGwoXG4gICAgc3RvcmFnZXNLZXlzLm1hcCgoc3RvcmFnZUtleTogYW55KSA9PiB7XG4gICAgICBjb25zdCB7IHN0b3JhZ2UsIGtleSB9ID0gc3RvcmFnZUtleTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzdG9yYWdlLmdldChrZXksIChkYXRhOiBhbnkpID0+IHJlc29sdmUoZGF0YSkpO1xuICAgICAgfSk7XG4gICAgfSlcbiAgKS50aGVuKChyZXMpID0+IHtcbiAgICBjb25zdCBkYXRhID0ge30gYXMgYW55O1xuICAgIHJlcy5mb3JFYWNoKChpdGVtLCBpZHgpID0+IChkYXRhW2tleXNbaWR4XV0gPSBpdGVtW2tleXNbaWR4XV0pKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfSk7XG4gIHJldHVybiBjYWxsYmFjayA/IHByb21pc2UudGhlbihjYWxsYmFjaykgOiBwcm9taXNlO1xufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL2JhY2tncm91bmQvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=