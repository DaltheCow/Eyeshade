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
    let promise = new Promise((resolve) => {
        storage.get(key, (data) => resolve(data));
    });
    return callback ? promise.then(callback) : promise;
};
exports.getStorage = getStorage;
const setStorage = (key, object, callback) => {
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
exports.setStorage = setStorage;
const getStorageAll = (keys, callback) => {
    const storagesKeys = keys.map((key) => {
        return { key, storage: chrome.storage[key === "settings" ? "sync" : "local"] };
    });
    let promise = Promise.all(storagesKeys.map((storageKey) => {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leWVzaGFkZS8uL2JhY2tncm91bmQvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvLi9tb2R1bGVzL3N0b3JhZ2UudHMiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSx3RkFBMkU7QUFFM0UsSUFBWSxZQU9YO0FBUEQsV0FBWSxZQUFZO0lBQ3RCLDJCQUFXO0lBQ1gsK0JBQWU7SUFDZixtQ0FBbUI7SUFDbkIsMkNBQTJCO0lBQzNCLHVDQUF1QjtJQUN2QixpQ0FBaUI7QUFDbkIsQ0FBQyxFQVBXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBT3ZCO0FBNkJELENBQUM7SUFDQywyQkFBYSxFQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUN4QyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBWSxFQUFFLEVBQUU7WUFDcEMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLEdBQzFGLE9BQU8sQ0FBQyxRQUFvQixDQUFDO1lBQy9CLElBQUksVUFBVSxJQUFJLGNBQWMsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFVBQVUsSUFBSTtvQkFDbEMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNqRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUMvQixJQUFJLEdBQUcsQ0FBQyxHQUFHLEVB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bnQiOlsiaW1wb3J0IHsgZ2V0U3RvcmFnZSwgc2V0U3RvcmFnZSwgZ2V0U3RvcmFnZUFsbCB9IGZyb20gXCIuLi9tb2R1bGVzL3N0b3JhZ2VcIjtcblxuZXhwb3J0IGVudW0gUmVkaXJlY3RFbnVtIHtcbiAgVVJMID0gXCJVUkxcIixcbiAgQkxBTksgPSBcIkJMQU5LXCIsXG4gIERFRkFVTFQgPSBcIkRFRkFVTFRcIixcbiAgRU5DT1VSQUdJTkcgPSBcIkVOQ09VUkFHSU5HXCIsXG4gIE9GRkVOU0lWRSA9IFwiT0ZGRU5TSVZFXCIsXG4gIENVU1RPTSA9IFwiQ1VTVE9NXCIsXG59XG5cbmV4cG9ydCB0eXBlIFRpcCA9IHtcbiAgdGl0bGU6IHN0cmluZztcbiAgdGV4dDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgVGlwU2V0dGluZ3MgPSB7XG4gIHRpcHM6IFRpcFtdO1xuICB0aGVtZToge1xuICAgIGNvbG9yOiB7XG4gICAgICBiYWNrZ3JvdW5kU3RhcnQ6IHN0cmluZztcbiAgICAgIGJhY2tncm91bmRFbmQ6IHN0cmluZztcbiAgICAgIGZvbnRGYW1pbHk6IHN0cmluZztcbiAgICAgIGZvbnRDb2xvcjogc3RyaW5nO1xuICAgIH07XG4gIH07XG59O1xuXG5leHBvcnQgdHlwZSBTZXR0aW5ncyA9IHtcbiAgaXNCbG9ja2luZz86IGJvb2xlYW47XG4gIGlzV2hpdGVMaXN0aW5nPzogYm9vbGVhbjtcbiAgc2l0ZUxpc3Q/OiBzdHJpbmdbXTtcbiAgd2hpdGVMaXN0U2l0ZXM/OiBzdHJpbmdbXTtcbiAgcmVkaXJlY3RMaW5rPzogc3RyaW5nO1xuICByZWRpcmVjdE9wdGlvbj86IFJlZGlyZWN0RW51bTtcbiAgdGlwU2V0dGluZ3M/OiBUaXBTZXR0aW5ncztcbn07XG5cbihmdW5jdGlvbiAoKSB7XG4gIGdldFN0b3JhZ2VBbGwoW1wic2V0dGluZ3NcIl0pLnRoZW4oKGRhdGEpID0+IHtcbiAgICBlbnN1cmVTZXR0aW5ncyhkYXRhLCAobmV3RGF0YTogYW55KSA9PiB7XG4gICAgICBjb25zdCB7IGlzQmxvY2tpbmcsIGlzV2hpdGVMaXN0aW5nLCBzaXRlTGlzdCwgd2hpdGVMaXN0U2l0ZXMsIHJlZGlyZWN0TGluaywgcmVkaXJlY3RPcHRpb24gfSA9XG4gICAgICAgIG5ld0RhdGEuc2V0dGluZ3MgYXMgU2V0dGluZ3M7XG4gICAgICBpZiAoaXNCbG9ja2luZyB8fCBpc1doaXRlTGlzdGluZykge1xuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgZnVuY3Rpb24gKHRhYnMpIHtcbiAgICAgICAgICBjb25zdCBzaXRlcyA9IChpc1doaXRlTGlzdGluZyA/IHdoaXRlTGlzdFNpdGVzIDogc2l0ZUxpc3QpIHx8IFtdO1xuICAgICAgICAgIEFycmF5LmZyb20odGFicykuZm9yRWFjaCgodGFiKSA9PiB7XG4gICAgICAgICAgICBpZiAodGFiLnVybCkge1xuICAgICAgICAgICAgICBibG9ja1NpdGVzKHRhYi5pZCwgdGFiLnVybCwgc2l0ZXMsIGlzV2hpdGVMaXN0aW5nLCByZWRpcmVjdExpbmssIHJlZGlyZWN0T3B0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSkoKTtcblxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGZ1bmN0aW9uICh0YWJJZCwgY2hhbmdlSW5mbykge1xuICBnZXRTdG9yYWdlKFwic2V0dGluZ3NcIiwgZnVuY3Rpb24gKGRhdGE6IGFueSkge1xuICAgIGNvbnN0IHsgaXNCbG9ja2luZywgaXNXaGl0ZUxpc3RpbmcsIHNpdGVMaXN0LCB3aGl0ZUxpc3RTaXRlcywgcmVkaXJlY3RMaW5rLCByZWRpcmVjdE9wdGlvbiB9ID1cbiAgICAgIGRhdGEuc2V0dGluZ3M7XG4gICAgaWYgKChpc0Jsb2NraW5nIHx8IGlzV2hpdGVMaXN0aW5nKSAmJiBjaGFuZ2VJbmZvLnVybCkge1xuICAgICAgY29uc3Qgc2l0ZXMgPSBpc1doaXRlTGlzdGluZyA/IHdoaXRlTGlzdFNpdGVzIDogc2l0ZUxpc3Q7XG4gICAgICBibG9ja1NpdGVzKHRhYklkLCBjaGFuZ2VJbmZvLnVybCwgc2l0ZXMsIGlzV2hpdGVMaXN0aW5nLCByZWRpcmVjdExpbmssIHJlZGlyZWN0T3B0aW9uKTtcbiAgICB9XG4gIH0pO1xufSk7XG5cbmNocm9tZS5zdG9yYWdlLm9uQ2hhbmdlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoY2hhbmdlcywgbmFtZXNwYWNlKSB7XG4gIGlmIChjaGFuZ2VzLnNldHRpbmdzKSB7XG4gICAgY29uc3QgeyBvbGRWYWx1ZSwgbmV3VmFsdWUgfSA9IGNoYW5nZXMuc2V0dGluZ3M7XG4gICAgaWYgKG9sZFZhbHVlICYmIG5ld1ZhbHVlKSB7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGlzQmxvY2tpbmc6IG5Jc0Jsb2NraW5nLFxuICAgICAgICBzaXRlTGlzdDogblNpdGVMaXN0LFxuICAgICAgICBpc1doaXRlTGlzdGluZzogbklzV2hpdGVMaXN0aW5nLFxuICAgICAgICB3aGl0ZUxpc3RTaXRlczogbldoaXRlTGlzdFNpdGVzLFxuICAgICAgICByZWRpcmVjdExpbmssXG4gICAgICAgIHJlZGlyZWN0T3B0aW9uLFxuICAgICAgfSA9IG5ld1ZhbHVlO1xuICAgICAgLy8gVE9ETyBpbiBmdXR1cmUgY2FuIG1ha2UgaXQgcG9zc2libGUgdG8gdHVybiBvZmYgYmxvY2sgc2l0ZXMgYW5kIHRoZW4gYW55IHBhZ2Ugd291bGQgZ28gYmFjayB0byB3aGF0IHdhcyBvcmlnaW5hbGx5IHNlYXJjaGVkIChpZiBJIHNhdmUgc2VhcmNoZWQgdmlkIHBlciB0YWIgcHJpb3IgdG8gYmxvY2tpbmcgc2FpZCBwYWdlKVxuICAgICAgY29uc3QgYmxvY2tFbmFibGVkID0gbklzQmxvY2tpbmcgfHwgbklzV2hpdGVMaXN0aW5nO1xuICAgICAgaWYgKGJsb2NrRW5hYmxlZCkge1xuICAgICAgICBjaHJvbWUudGFicy5xdWVyeSh7fSwgZnVuY3Rpb24gKHRhYnMpIHtcbiAgICAgICAgICBjb25zdCBzaXRlTGlzdCA9IG5Jc1doaXRlTGlzdGluZyA/IG5XaGl0ZUxpc3RTaXRlcyA6IG5TaXRlTGlzdDtcbiAgICAgICAgICBBcnJheS5mcm9tKHRhYnMpLmZvckVhY2goKHRhYikgPT4ge1xuICAgICAgICAgICAgaWYgKHRhYi51cmwpIHtcbiAgICAgICAgICAgICAgYmxvY2tTaXRlcyh0YWIuaWQsIHRhYi51cmwsIHNpdGVMaXN0LCBuSXNXaGl0ZUxpc3RpbmcsIHJlZGlyZWN0TGluaywgcmVkaXJlY3RPcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pO1xuXG4vLyBuZXZlciBibG9jayBzaXRlcyB3aXRoIHRoZXNlIHRlcm1zXG5jb25zdCBpZ25vcmVTaXRlID0gKHVybDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGlnbm9yZVNpdGVzID0gW1wiY2hyb21lLWV4dGVuc2lvbjovL1wiLCBcImNocm9tZTpcIl07XG4gIHJldHVybiBpZ25vcmVTaXRlcy5zb21lKChzaXRlKSA9PiB1cmwuaW5kZXhPZihzaXRlKSA9PT0gMCk7XG59O1xuXG5mdW5jdGlvbiBibG9ja1NpdGVzKFxuICB0YWJJZDogYW55LFxuICB1cmw6IHN0cmluZyxcbiAgc2l0ZUxpc3Q6IHN0cmluZ1tdLFxuICBpc1doaXRlbGlzdCA9IGZhbHNlLFxuICByZWRpcmVjdExpbms6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgcmVkaXJlY3RPcHRpb24gPSBSZWRpcmVjdEVudW0uQkxBTktcbikge1xuICBpZiAoaWdub3JlU2l0ZSh1cmwpKSByZXR1cm47XG4gIGNvbnN0IGlzSW5MaXN0ID0gc2l0ZUxpc3QuZmluZCgoc2l0ZSkgPT4ge1xuICAgIHJldHVybiB1cmwuaW5kZXhPZihcImh0dHBzOi8vXCIgKyBzaXRlKSA9PT0gMCB8fCB1cmwuaW5kZXhPZihcImh0dHA6Ly9cIiArIHNpdGUpID09PSAwO1xuICB9KTtcbiAgY29uc3Qgc2hvdWxkQmVCbG9ja2VkID0gKGlzSW5MaXN0ICYmICFpc1doaXRlbGlzdCkgfHwgKCFpc0luTGlzdCAmJiBpc1doaXRlbGlzdCk7XG4gIGlmIChzaG91bGRCZUJsb2NrZWQpIHtcbiAgICAvLyBjYW4gSSBwdXNoIHRoZSBjdXJyZW50IHVybCBvbnRvIGhpc3Rvcnkgc28gaXQgaXNuJ3QgbG9zdCBiZWZvcmUgcmVkaXJlY3Q/XG4gICAgY29uc3QgdXJsID1cbiAgICAgIHJlZGlyZWN0T3B0aW9uID09PSBSZWRpcmVjdEVudW0uVVJMICYmIHJlZGlyZWN0TGlua1xuICAgICAgICA/IFwiaHR0cHM6Ly9cIiArIHJlZGlyZWN0TGlua1xuICAgICAgICA6IFwibm90X2F2YWlsYWJsZS9ub3RfYXZhaWxhYmxlLmh0bWxcIjtcbiAgICBjaHJvbWUudGFicy51cGRhdGUodGFiSWQsIHsgdXJsIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuc3VyZVNldHRpbmdzKGRhdGE6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICBjb25zdCBwcmV2U2V0dGluZ3MgPSBkYXRhLnNldHRpbmdzIHx8IHt9O1xuXG4gIGxldCB7IGlzQmxvY2tpbmcsIHNpdGVMaXN0LCBpc1doaXRlTGlzdGluZywgd2hpdGVMaXN0U2l0ZXMsIHJlZGlyZWN0TGluaywgcmVkaXJlY3RPcHRpb24gfSA9XG4gICAgcHJldlNldHRpbmdzO1xuXG4gIGlzQmxvY2tpbmcgPSBCb29sZWFuKGlzQmxvY2tpbmcpO1xuICBpc1doaXRlTGlzdGluZyA9IEJvb2xlYW4oaXNXaGl0ZUxpc3RpbmcpO1xuICBzaXRlTGlzdCA9IHNpdGVMaXN0ID09PSB1bmRlZmluZWQgPyBbXSA6IHNpdGVMaXN0O1xuICB3aGl0ZUxpc3RTaXRlcyA9IHdoaXRlTGlzdFNpdGVzID09PSB1bmRlZmluZWQgPyBbXSA6IHdoaXRlTGlzdFNpdGVzO1xuICByZWRpcmVjdExpbmsgPSByZWRpcmVjdExpbmsgfHwgXCJcIjtcbiAgcmVkaXJlY3RPcHRpb24gPSByZWRpcmVjdE9wdGlvbiB8fCBSZWRpcmVjdEVudW0uREVGQVVMVDtcbiAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgaXNCbG9ja2luZyxcbiAgICBzaXRlTGlzdCxcbiAgICBpc1doaXRlTGlzdGluZyxcbiAgICB3aGl0ZUxpc3RTaXRlcyxcbiAgICByZWRpcmVjdExpbmssXG4gICAgcmVkaXJlY3RPcHRpb24sXG4gIH07XG4gIC8vdXBkYXRlIHN0b3JhZ2UgdXNlIHRvIG5ldyBzZXQgZnVuY3Rpb25cbiAgbGV0IG5ld0RhdGEgPSB7fTtcbiAgc2V0U3RvcmFnZShcInNldHRpbmdzXCIsIHsgc2V0dGluZ3MgfSkudGhlbigoZGF0YSkgPT4ge1xuICAgIG5ld0RhdGEgPSBPYmplY3QuYXNzaWduKG5ld0RhdGEsIGRhdGEpO1xuICAgIGNhbGxiYWNrKG5ld0RhdGEpO1xuICB9KTtcbn1cbiIsImV4cG9ydCBjb25zdCBnZXRTdG9yYWdlID0gKGtleTogc3RyaW5nLCBjYWxsYmFjaz86IGFueSkgPT4ge1xuICBjb25zdCBzdG9yYWdlID0ga2V5ID09PSBcInNldHRpbmdzXCIgPyBjaHJvbWUuc3RvcmFnZS5zeW5jIDogY2hyb21lLnN0b3JhZ2UubG9jYWw7XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzdG9yYWdlLmdldChrZXksIChkYXRhKSA9PiByZXNvbHZlKGRhdGEpKTtcbiAgfSk7XG4gIHJldHVybiBjYWxsYmFjayA/IHByb21pc2UudGhlbihjYWxsYmFjaykgOiBwcm9taXNlO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFN0b3JhZ2UgPSAoa2V5OiBzdHJpbmcsIG9iamVjdDogYW55LCBjYWxsYmFjaz86IGFueSkgPT4ge1xuICBjb25zdCBzdG9yYWdlID0ga2V5ID09PSBcInNldHRpbmdzXCIgPyBjaHJvbWUuc3RvcmFnZS5zeW5jIDogY2hyb21lLnN0b3JhZ2UubG9jYWw7XG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBzdG9yYWdlLnNldChvYmplY3QsICgpID0+IHtcbiAgICAgIHN0b3JhZ2UuZ2V0KGtleSwgKGRhdGEpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc29sdmUoZGF0YSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBjYWxsYmFjayA/IHByb21pc2UudGhlbihjYWxsYmFjaykgOiBwcm9taXNlO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2VBbGwgPSAoa2V5czogYW55LCBjYWxsYmFjaz86IGFueSkgPT4ge1xuICBjb25zdCBzdG9yYWdlc0tleXMgPSBrZXlzLm1hcCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICByZXR1cm4geyBrZXksIHN0b3JhZ2U6IGNocm9tZS5zdG9yYWdlW2tleSA9PT0gXCJzZXR0aW5nc1wiID8gXCJzeW5jXCIgOiBcImxvY2FsXCJdIH07XG4gIH0pO1xuICBsZXQgcHJvbWlzZSA9IFByb21pc2UuYWxsKFxuICAgIHN0b3JhZ2VzS2V5cy5tYXAoKHN0b3JhZ2VLZXk6IGFueSkgPT4ge1xuICAgICAgY29uc3QgeyBzdG9yYWdlLCBrZXkgfSA9IHN0b3JhZ2VLZXk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc3RvcmFnZS5nZXQoa2V5LCAoZGF0YTogYW55KSA9PiByZXNvbHZlKGRhdGEpKTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICkudGhlbigocmVzKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IHt9IGFzIGFueTtcbiAgICByZXMuZm9yRWFjaCgoaXRlbSwgaWR4KSA9PiAoZGF0YVtrZXlzW2lkeF1dID0gaXRlbVtrZXlzW2lkeF1dKSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH0pO1xuICByZXR1cm4gY2FsbGJhY2sgPyBwcm9taXNlLnRoZW4oY2FsbGJhY2spIDogcHJvbWlzZTtcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9iYWNrZ3JvdW5kL2luZGV4LnRzXCIpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==