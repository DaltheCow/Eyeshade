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
            const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption } = newData.settings;
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
    (0, storage_1.getStorage)("settings", function (data) {
        const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption } = data.settings;
        if ((isBlocking || isWhiteListing) && changeInfo.url) {
            const sites = isWhiteListing ? whiteListSites : siteList;
            blockSites(tabId, changeInfo.url, sites, isWhiteListing, redirectLink, redirectOption);
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
            const { isBlocking: nIsBlocking, siteList: nSiteList, isWhiteListing: nIsWhiteListing, whiteListSites: nWhiteListSites, redirectLink, redirectOption, timer, } = newValue;
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
                            blockSites(tab.id, tab.url, siteList, nIsWhiteListing, redirectLink, redirectOption);
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
function blockSites(tabId, url, siteList, isWhitelist = false, redirectLink, redirectOption = RedirectEnum.BLANK) {
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
    const prevSettings = data.settings || {};
    let { isBlocking, siteList, isWhiteListing, whiteListSites, redirectLink, redirectOption, timer, savedMinutes, savedHours, } = prevSettings;
    isBlocking = Boolean(isBlocking);
    isWhiteListing = Boolean(isWhiteListing);
    siteList = siteList === undefined ? [] : siteList;
    whiteListSites = whiteListSites === undefined ? [] : whiteListSites;
    redirectLink = redirectLink || "";
    redirectOption = redirectOption || RedirectEnum.DEFAULT;
    timer || (timer = null);
    savedMinutes || (savedMinutes = 0);
    savedHours || (savedHours = 0);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leWVzaGFkZS8uL2JhY2tncm91bmQvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvLi9tb2R1bGVzL3N0b3JhZ2UudHMiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSx3RkFBMkU7QUFFM0UsSUFBWSxZQU9YO0FBUEQsV0FBWSxZQUFZO0lBQ3RCLDJCQUFXO0lBQ1gsK0JBQWU7SUFDZixtQ0FBbUI7SUFDbkIsMkNBQTJCO0lBQzNCLHVDQUF1QjtJQUN2QixpQ0FBaUI7QUFDbkIsQ0FBQyxFQVBXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBT3ZCO0FBZ0NELENBQUM7SUFDQywyQkFBYSxFQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUN4QyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBWSxFQUFFLEVBQUU7WUFDcEMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLEdBQzFGLE9BQU8sQ0FBQyxRQUFvQixDQUFDO1lBQy9CLElBQUksVUFBVSxJQUFJLGNBQWMsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFVBQVUsSUFBSTtvQkFDbEMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNqRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUMvQixJQUFJLEdBQUcsQ0FBQyxHQUFHLEVB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QyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNyRCxDQUFDLENBQUM7QUFqQlcscUJBQWEsaUJBaUJ4Qjs7Ozs7OztVQ3JDRjtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VDdEJBO1VBQ0E7VUFDQTtVQUNBIiwiZmlsZSI6ImJhY2tncm91bmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRTdG9yYWdlLCBzZXRTdG9yYWdlLCBnZXRTdG9yYWdlQWxsIH0gZnJvbSBcIi4uL21vZHVsZXMvc3RvcmFnZVwiO1xuXG5leHBvcnQgZW51bSBSZWRpcmVjdEVudW0ge1xuICBVUkwgPSBcIlVSTFwiLFxuICBCTEFOSyA9IFwiQkxBTktcIixcbiAgREVGQVVMVCA9IFwiREVGQVVMVFwiLFxuICBFTkNPVVJBR0lORyA9IFwiRU5DT1VSQUdJTkdcIixcbiAgT0ZGRU5TSVZFID0gXCJPRkZFTlNJVkVcIixcbiAgQ1VTVE9NID0gXCJDVVNUT01cIixcbn1cblxuZXhwb3J0IHR5cGUgVGlwID0ge1xuICB0aXRsZTogc3RyaW5nO1xuICB0ZXh0OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBUaXBTZXR0aW5ncyA9IHtcbiAgdGlwczogVGlwW107XG4gIHRoZW1lOiB7XG4gICAgY29sb3I6IHtcbiAgICAgIGJhY2tncm91bmRTdGFydDogc3RyaW5nO1xuICAgICAgYmFja2dyb3VuZEVuZDogc3RyaW5nO1xuICAgICAgZm9udEZhbWlseTogc3RyaW5nO1xuICAgICAgZm9udENvbG9yOiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbn07XG5cbmV4cG9ydCB0eXBlIFNldHRpbmdzID0ge1xuICBpc0Jsb2NraW5nPzogYm9vbGVhbjtcbiAgaXNXaGl0ZUxpc3Rpbmc/OiBib29sZWFuO1xuICBzaXRlTGlzdD86IHN0cmluZ1tdO1xuICB3aGl0ZUxpc3RTaXRlcz86IHN0cmluZ1tdO1xuICByZWRpcmVjdExpbms/OiBzdHJpbmc7XG4gIHJlZGlyZWN0T3B0aW9uPzogUmVkaXJlY3RFbnVtO1xuICB0aXBTZXR0aW5ncz86IFRpcFNldHRpbmdzO1xuICB0aW1lcj86IG51bWJlciB8IG51bGw7XG4gIHNhdmVkTWludXRlczogbnVtYmVyO1xuICBzYXZlZEhvdXJzOiBudW1iZXI7XG59O1xuXG4oZnVuY3Rpb24gKCkge1xuICBnZXRTdG9yYWdlQWxsKFtcInNldHRpbmdzXCJdKS50aGVuKChkYXRhKSA9PiB7XG4gICAgZW5zdXJlU2V0dGluZ3MoZGF0YSwgKG5ld0RhdGE6IGFueSkgPT4ge1xuICAgICAgY29uc3QgeyBpc0Jsb2NraW5nLCBpc1doaXRlTGlzdGluZywgc2l0ZUxpc3QsIHdoaXRlTGlzdFNpdGVzLCByZWRpcmVjdExpbmssIHJlZGlyZWN0T3B0aW9uIH0gPVxuICAgICAgICBuZXdEYXRhLnNldHRpbmdzIGFzIFNldHRpbmdzO1xuICAgICAgaWYgKGlzQmxvY2tpbmcgfHwgaXNXaGl0ZUxpc3RpbmcpIHtcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe30sIGZ1bmN0aW9uICh0YWJzKSB7XG4gICAgICAgICAgY29uc3Qgc2l0ZXMgPSAoaXNXaGl0ZUxpc3RpbmcgPyB3aGl0ZUxpc3RTaXRlcyA6IHNpdGVMaXN0KSB8fCBbXTtcbiAgICAgICAgICBBcnJheS5mcm9tKHRhYnMpLmZvckVhY2goKHRhYikgPT4ge1xuICAgICAgICAgICAgaWYgKHRhYi51cmwpIHtcbiAgICAgICAgICAgICAgYmxvY2tTaXRlcyh0YWIuaWQsIHRhYi51cmwsIHNpdGVzLCBpc1doaXRlTGlzdGluZywgcmVkaXJlY3RMaW5rLCByZWRpcmVjdE9wdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn0pKCk7XG5cbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAodGFiSWQsIGNoYW5nZUluZm8pIHtcbiAgZ2V0U3RvcmFnZShcInNldHRpbmdzXCIsIGZ1bmN0aW9uIChkYXRhOiBhbnkpIHtcbiAgICBjb25zdCB7IGlzQmxvY2tpbmcsIGlzV2hpdGVMaXN0aW5nLCBzaXRlTGlzdCwgd2hpdGVMaXN0U2l0ZXMsIHJlZGlyZWN0TGluaywgcmVkaXJlY3RPcHRpb24gfSA9XG4gICAgICBkYXRhLnNldHRpbmdzO1xuICAgIGlmICgoaXNCbG9ja2luZyB8fCBpc1doaXRlTGlzdGluZykgJiYgY2hhbmdlSW5mby51cmwpIHtcbiAgICAgIGNvbnN0IHNpdGVzID0gaXNXaGl0ZUxpc3RpbmcgPyB3aGl0ZUxpc3RTaXRlcyA6IHNpdGVMaXN0O1xuICAgICAgYmxvY2tTaXRlcyh0YWJJZCwgY2hhbmdlSW5mby51cmwsIHNpdGVzLCBpc1doaXRlTGlzdGluZywgcmVkaXJlY3RMaW5rLCByZWRpcmVjdE9wdGlvbik7XG4gICAgfVxuICB9KTtcbn0pO1xuXG5jaHJvbWUuYWxhcm1zLm9uQWxhcm0uYWRkTGlzdGVuZXIoKCkgPT4ge1xuICBnZXRTdG9yYWdlKFwic2V0dGluZ3NcIiwgKGRhdGE6IGFueSkgPT4ge1xuICAgIGNvbnN0IHsgc2V0dGluZ3MgfSA9IGRhdGE7XG4gICAgc2V0U3RvcmFnZShcInNldHRpbmdzXCIsIHtcbiAgICAgIHNldHRpbmdzOiB7IC4uLnNldHRpbmdzLCB0aW1lcjogbnVsbCwgaXNCbG9ja2luZzogZmFsc2UsIGlzV2hpdGVMaXN0aW5nOiBmYWxzZSB9LFxuICAgIH0pO1xuICB9KTtcbn0pO1xuXG5jaHJvbWUuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKGNoYW5nZXMsIG5hbWVzcGFjZSkge1xuICBpZiAoY2hhbmdlcy5zZXR0aW5ncykge1xuICAgIGNvbnN0IHsgb2xkVmFsdWUsIG5ld1ZhbHVlIH0gPSBjaGFuZ2VzLnNldHRpbmdzO1xuICAgIGlmIChvbGRWYWx1ZSAmJiBuZXdWYWx1ZSkge1xuICAgICAgY29uc3Qge1xuICAgICAgICBpc0Jsb2NraW5nOiBuSXNCbG9ja2luZyxcbiAgICAgICAgc2l0ZUxpc3Q6IG5TaXRlTGlzdCxcbiAgICAgICAgaXNXaGl0ZUxpc3Rpbmc6IG5Jc1doaXRlTGlzdGluZyxcbiAgICAgICAgd2hpdGVMaXN0U2l0ZXM6IG5XaGl0ZUxpc3RTaXRlcyxcbiAgICAgICAgcmVkaXJlY3RMaW5rLFxuICAgICAgICByZWRpcmVjdE9wdGlvbixcbiAgICAgICAgdGltZXIsXG4gICAgICB9ID0gbmV3VmFsdWU7XG4gICAgICAvLyBUT0RPIGluIGZ1dHVyZSBjYW4gbWFrZSBpdCBwb3NzaWJsZSB0byB0dXJuIG9mZiBibG9jayBzaXRlcyBhbmQgdGhlbiBhbnkgcGFnZSB3b3VsZCBnbyBiYWNrIHRvIHdoYXQgd2FzIG9yaWdpbmFsbHkgc2VhcmNoZWQgKGlmIEkgc2F2ZSBzZWFyY2hlZCB2aWQgcGVyIHRhYiBwcmlvciB0byBibG9ja2luZyBzYWlkIHBhZ2UpLiBjdXJyZW50bHkgYmxvY2tpbmcgaXQgc2VlbXMgdG8gb3ZlcndyaXRlIHRoZSBwYWdlIGluIGhpc3RvcnlcbiAgICAgIGNvbnN0IGJsb2NraW5nV2FzRGlzYWJsZWQgPVxuICAgICAgICAobklzQmxvY2tpbmcgIT09IG9sZFZhbHVlLmlzQmxvY2tpbmcgJiYgIW5Jc0Jsb2NraW5nKSB8fFxuICAgICAgICAobklzV2hpdGVMaXN0aW5nICE9PSBvbGRWYWx1ZS5pc1doaXRlTGlzdGluZyAmJiAhbklzV2hpdGVMaXN0aW5nKTtcbiAgICAgIGlmICh0aW1lciAmJiBibG9ja2luZ1dhc0Rpc2FibGVkKSB7XG4gICAgICAgIGNocm9tZS5hbGFybXMuY2xlYXJBbGwoKTtcbiAgICAgICAgc2V0U3RvcmFnZShcInNldHRpbmdzXCIsIHsgc2V0dGluZ3M6IHsgLi4ubmV3VmFsdWUsIHRpbWVyOiBudWxsIH0gfSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRpbWVyICYmIG9sZFZhbHVlLnRpbWVyKSBjaHJvbWUuYWxhcm1zLmNsZWFyQWxsKCk7XG4gICAgICBpZiAodGltZXIgJiYgdGltZXIgIT09IG9sZFZhbHVlLnRpbWVyKSB7XG4gICAgICAgIGNocm9tZS5hbGFybXMuY2xlYXJBbGwoKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJjcmVhdGVkIHRpbWVyXCIpO1xuICAgICAgICBjaHJvbWUuYWxhcm1zLmNyZWF0ZSh7IGRlbGF5SW5NaW51dGVzOiBNYXRoLnJvdW5kKCh0aW1lciAtIERhdGUubm93KCkpIC8gMTAwMCAvIDYwKSB9KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGJsb2NrRW5hYmxlZCA9IG5Jc0Jsb2NraW5nIHx8IG5Jc1doaXRlTGlzdGluZztcbiAgICAgIGlmIChibG9ja0VuYWJsZWQpIHtcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe30sIGZ1bmN0aW9uICh0YWJzKSB7XG4gICAgICAgICAgY29uc3Qgc2l0ZUxpc3QgPSBuSXNXaGl0ZUxpc3RpbmcgPyBuV2hpdGVMaXN0U2l0ZXMgOiBuU2l0ZUxpc3Q7XG4gICAgICAgICAgQXJyYXkuZnJvbSh0YWJzKS5mb3JFYWNoKCh0YWIpID0+IHtcbiAgICAgICAgICAgIGlmICh0YWIudXJsKSB7XG4gICAgICAgICAgICAgIGJsb2NrU2l0ZXModGFiLmlkLCB0YWIudXJsLCBzaXRlTGlzdCwgbklzV2hpdGVMaXN0aW5nLCByZWRpcmVjdExpbmssIHJlZGlyZWN0T3B0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxuLy8gbmV2ZXIgYmxvY2sgc2l0ZXMgd2l0aCB0aGVzZSB0ZXJtc1xuY29uc3QgaWdub3JlU2l0ZSA9ICh1cmw6IHN0cmluZykgPT4ge1xuICBjb25zdCBpZ25vcmVTaXRlcyA9IFtcImNocm9tZS1leHRlbnNpb246Ly9cIiwgXCJjaHJvbWU6XCJdO1xuICByZXR1cm4gaWdub3JlU2l0ZXMuc29tZSgoc2l0ZSkgPT4gdXJsLmluZGV4T2Yoc2l0ZSkgPT09IDApO1xufTtcblxuZnVuY3Rpb24gYmxvY2tTaXRlcyhcbiAgdGFiSWQ6IGFueSxcbiAgdXJsOiBzdHJpbmcsXG4gIHNpdGVMaXN0OiBzdHJpbmdbXSxcbiAgaXNXaGl0ZWxpc3QgPSBmYWxzZSxcbiAgcmVkaXJlY3RMaW5rOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIHJlZGlyZWN0T3B0aW9uID0gUmVkaXJlY3RFbnVtLkJMQU5LXG4pIHtcbiAgaWYgKGlnbm9yZVNpdGUodXJsKSkgcmV0dXJuO1xuICBjb25zdCBpc0luTGlzdCA9IHNpdGVMaXN0LmZpbmQoKHNpdGUpID0+IHtcbiAgICByZXR1cm4gdXJsLmluZGV4T2YoXCJodHRwczovL1wiICsgc2l0ZSkgPT09IDAgfHwgdXJsLmluZGV4T2YoXCJodHRwOi8vXCIgKyBzaXRlKSA9PT0gMDtcbiAgfSk7XG4gIGNvbnN0IHNob3VsZEJlQmxvY2tlZCA9IChpc0luTGlzdCAmJiAhaXNXaGl0ZWxpc3QpIHx8ICghaXNJbkxpc3QgJiYgaXNXaGl0ZWxpc3QpO1xuICBpZiAoc2hvdWxkQmVCbG9ja2VkKSB7XG4gICAgLy8gY2FuIEkgcHVzaCB0aGUgY3VycmVudCB1cmwgb250byBoaXN0b3J5IHNvIGl0IGlzbid0IGxvc3QgYmVmb3JlIHJlZGlyZWN0P1xuICAgIGNvbnN0IHVybCA9XG4gICAgICByZWRpcmVjdE9wdGlvbiA9PT0gUmVkaXJlY3RFbnVtLlVSTCAmJiByZWRpcmVjdExpbmtcbiAgICAgICAgPyBcImh0dHBzOi8vXCIgKyByZWRpcmVjdExpbmtcbiAgICAgICAgOiBcIm5vdF9hdmFpbGFibGUvbm90X2F2YWlsYWJsZS5odG1sXCI7XG4gICAgY2hyb21lLnRhYnMudXBkYXRlKHRhYklkLCB7IHVybCB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbnN1cmVTZXR0aW5ncyhkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgY29uc3QgcHJldlNldHRpbmdzID0gZGF0YS5zZXR0aW5ncyB8fCB7fTtcblxuICBsZXQge1xuICAgIGlzQmxvY2tpbmcsXG4gICAgc2l0ZUxpc3QsXG4gICAgaXNXaGl0ZUxpc3RpbmcsXG4gICAgd2hpdGVMaXN0U2l0ZXMsXG4gICAgcmVkaXJlY3RMaW5rLFxuICAgIHJlZGlyZWN0T3B0aW9uLFxuICAgIHRpbWVyLFxuICAgIHNhdmVkTWludXRlcyxcbiAgICBzYXZlZEhvdXJzLFxuICB9ID0gcHJldlNldHRpbmdzO1xuXG4gIGlzQmxvY2tpbmcgPSBCb29sZWFuKGlzQmxvY2tpbmcpO1xuICBpc1doaXRlTGlzdGluZyA9IEJvb2xlYW4oaXNXaGl0ZUxpc3RpbmcpO1xuICBzaXRlTGlzdCA9IHNpdGVMaXN0ID09PSB1bmRlZmluZWQgPyBbXSA6IHNpdGVMaXN0O1xuICB3aGl0ZUxpc3RTaXRlcyA9IHdoaXRlTGlzdFNpdGVzID09PSB1bmRlZmluZWQgPyBbXSA6IHdoaXRlTGlzdFNpdGVzO1xuICByZWRpcmVjdExpbmsgPSByZWRpcmVjdExpbmsgfHwgXCJcIjtcbiAgcmVkaXJlY3RPcHRpb24gPSByZWRpcmVjdE9wdGlvbiB8fCBSZWRpcmVjdEVudW0uREVGQVVMVDtcbiAgdGltZXIgfHw9IG51bGw7XG4gIHNhdmVkTWludXRlcyB8fD0gMDtcbiAgc2F2ZWRIb3VycyB8fD0gMDtcbiAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgaXNCbG9ja2luZyxcbiAgICBzaXRlTGlzdCxcbiAgICBpc1doaXRlTGlzdGluZyxcbiAgICB3aGl0ZUxpc3RTaXRlcyxcbiAgICByZWRpcmVjdExpbmssXG4gICAgcmVkaXJlY3RPcHRpb24sXG4gICAgdGltZXIsXG4gICAgc2F2ZWRNaW51dGVzLFxuICAgIHNhdmVkSG91cnMsXG4gIH07XG4gIC8vdXBkYXRlIHN0b3JhZ2UgdXNlIHRvIG5ldyBzZXQgZnVuY3Rpb25cbiAgbGV0IG5ld0RhdGEgPSB7fTtcbiAgc2V0U3RvcmFnZShcInNldHRpbmdzXCIsIHsgc2V0dGluZ3MgfSkudGhlbigoZGF0YSkgPT4ge1xuICAgIG5ld0RhdGEgPSBPYmplY3QuYXNzaWduKG5ld0RhdGEsIGRhdGEpO1xuICAgIGNhbGxiYWNrKG5ld0RhdGEpO1xuICB9KTtcbn1cbiIsImV4cG9ydCBjb25zdCBnZXRTdG9yYWdlID0gKGtleTogc3RyaW5nLCBjYWxsYmFjaz86IGFueSkgPT4ge1xuICBjb25zdCBzdG9yYWdlID0ga2V5ID09PSBcInNldHRpbmdzXCIgPyBjaHJvbWUuc3RvcmFnZS5zeW5jIDogY2hyb21lLnN0b3JhZ2UubG9jYWw7XG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHN0b3JhZ2UuZ2V0KGtleSwgKGRhdGEpID0+IHJlc29sdmUoZGF0YSkpO1xuICB9KTtcbiAgcmV0dXJuIGNhbGxiYWNrID8gcHJvbWlzZS50aGVuKGNhbGxiYWNrKSA6IHByb21pc2U7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0U3RvcmFnZSA9IChrZXk6IHN0cmluZywgb2JqZWN0OiBhbnksIGNhbGxiYWNrPzogYW55KSA9PiB7XG4gIGNvbnN0IHN0b3JhZ2UgPSBrZXkgPT09IFwic2V0dGluZ3NcIiA/IGNocm9tZS5zdG9yYWdlLnN5bmMgOiBjaHJvbWUuc3RvcmFnZS5sb2NhbDtcbiAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgc3RvcmFnZS5zZXQob2JqZWN0LCAoKSA9PiB7XG4gICAgICBzdG9yYWdlLmdldChrZXksIChkYXRhKSA9PiB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKGRhdGEpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuICByZXR1cm4gY2FsbGJhY2sgPyBwcm9taXNlLnRoZW4oY2FsbGJhY2spIDogcHJvbWlzZTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRTdG9yYWdlQWxsID0gKGtleXM6IGFueSwgY2FsbGJhY2s/OiBhbnkpID0+IHtcbiAgY29uc3Qgc3RvcmFnZXNLZXlzID0ga2V5cy5tYXAoKGtleTogc3RyaW5nKSA9PiB7XG4gICAgcmV0dXJuIHsga2V5LCBzdG9yYWdlOiBjaHJvbWUuc3RvcmFnZVtrZXkgPT09IFwic2V0dGluZ3NcIiA/IFwic3luY1wiIDogXCJsb2NhbFwiXSB9O1xuICB9KTtcbiAgY29uc3QgcHJvbWlzZSA9IFByb21pc2UuYWxsKFxuICAgIHN0b3JhZ2VzS2V5cy5tYXAoKHN0b3JhZ2VLZXk6IGFueSkgPT4ge1xuICAgICAgY29uc3QgeyBzdG9yYWdlLCBrZXkgfSA9IHN0b3JhZ2VLZXk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc3RvcmFnZS5nZXQoa2V5LCAoZGF0YTogYW55KSA9PiByZXNvbHZlKGRhdGEpKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICkudGhlbigocmVzKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IHt9IGFzIGFueTtcbiAgICByZXMuZm9yRWFjaCgoaXRlbSwgaWR4KSA9PiAoZGF0YVtrZXlzW2lkeF1dID0gaXRlbVtrZXlzW2lkeF1dKSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH0pO1xuICByZXR1cm4gY2FsbGJhY2sgPyBwcm9taXNlLnRoZW4oY2FsbGJhY2spIDogcHJvbWlzZTtcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9iYWNrZ3JvdW5kL2luZGV4LnRzXCIpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==