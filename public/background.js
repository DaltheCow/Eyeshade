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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leWVzaGFkZS8uL2JhY2tncm91bmQvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvLi9tb2R1bGVzL3N0b3JhZ2UudHMiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXllc2hhZGUvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSx3RkFBMkU7QUFFM0UsSUFBWSxZQU9YO0FBUEQsV0FBWSxZQUFZO0lBQ3RCLDJCQUFXO0lBQ1gsK0JBQWU7SUFDZixtQ0FBbUI7SUFDbkIsMkNBQTJCO0lBQzNCLHVDQUF1QjtJQUN2QixpQ0FBaUI7QUFDbkIsQ0FBQyxFQVBXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBT3ZCO0FBNkJELENBQUM7SUFDQywyQkFBYSxFQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUN4QyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBWSxFQUFFLEVBQUU7WUFDcEMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLEdBQzFGLE9BQU8sQ0FBQyxRQUFvQixDQUFDO1lBQy9CLElBQUksVUFBVSxJQUFJLGNBQWMsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFVBQVUsSUFBSTtvQkFDbEMsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztvQkFDekQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTt3QkFDL0IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEdB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QUFFO1FBQ25DLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDO1FBQ3BDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQVMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FDSCxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ2IsTUFBTSxJQUFJLEdBQUcsRUFBUyxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQ3JELENBQUMsQ0FBQztBQWpCVyxxQkFBYSxpQkFpQnhCOzs7Ozs7O1VDckNGO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUN0QkE7VUFDQTtVQUNBO1VBQ0EiLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldFN0b3JhZ2UsIHNldFN0b3JhZ2UsIGdldFN0b3JhZ2VBbGwgfSBmcm9tIFwiLi4vbW9kdWxlcy9zdG9yYWdlXCI7XG5cbmV4cG9ydCBlbnVtIFJlZGlyZWN0RW51bSB7XG4gIFVSTCA9IFwiVVJMXCIsXG4gIEJMQU5LID0gXCJCTEFOS1wiLFxuICBERUZBVUxUID0gXCJERUZBVUxUXCIsXG4gIEVOQ09VUkFHSU5HID0gXCJFTkNPVVJBR0lOR1wiLFxuICBPRkZFTlNJVkUgPSBcIk9GRkVOU0lWRVwiLFxuICBDVVNUT00gPSBcIkNVU1RPTVwiLFxufVxuXG5leHBvcnQgdHlwZSBUaXAgPSB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHRleHQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFRpcFNldHRpbmdzID0ge1xuICB0aXBzOiBUaXBbXTtcbiAgdGhlbWU6IHtcbiAgICBjb2xvcjoge1xuICAgICAgYmFja2dyb3VuZFN0YXJ0OiBzdHJpbmc7XG4gICAgICBiYWNrZ3JvdW5kRW5kOiBzdHJpbmc7XG4gICAgICBmb250RmFtaWx5OiBzdHJpbmc7XG4gICAgICBmb250Q29sb3I6IHN0cmluZztcbiAgICB9O1xuICB9O1xufTtcblxuZXhwb3J0IHR5cGUgU2V0dGluZ3MgPSB7XG4gIGlzQmxvY2tpbmc/OiBib29sZWFuO1xuICBpc1doaXRlTGlzdGluZz86IGJvb2xlYW47XG4gIHNpdGVMaXN0Pzogc3RyaW5nW107XG4gIHdoaXRlTGlzdFNpdGVzPzogc3RyaW5nW107XG4gIHJlZGlyZWN0TGluaz86IHN0cmluZztcbiAgcmVkaXJlY3RPcHRpb24/OiBSZWRpcmVjdEVudW07XG4gIHRpcFNldHRpbmdzPzogVGlwU2V0dGluZ3M7XG59O1xuXG4oZnVuY3Rpb24gKCkge1xuICBnZXRTdG9yYWdlQWxsKFtcInNldHRpbmdzXCJdKS50aGVuKChkYXRhKSA9PiB7XG4gICAgZW5zdXJlU2V0dGluZ3MoZGF0YSwgKG5ld0RhdGE6IGFueSkgPT4ge1xuICAgICAgY29uc3QgeyBpc0Jsb2NraW5nLCBpc1doaXRlTGlzdGluZywgc2l0ZUxpc3QsIHdoaXRlTGlzdFNpdGVzLCByZWRpcmVjdExpbmssIHJlZGlyZWN0T3B0aW9uIH0gPVxuICAgICAgICBuZXdEYXRhLnNldHRpbmdzIGFzIFNldHRpbmdzO1xuICAgICAgaWYgKGlzQmxvY2tpbmcgfHwgaXNXaGl0ZUxpc3RpbmcpIHtcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoe30sIGZ1bmN0aW9uICh0YWJzKSB7XG4gICAgICAgICAgY29uc3Qgc2l0ZXMgPSBpc1doaXRlTGlzdGluZyA/IHdoaXRlTGlzdFNpdGVzIDogc2l0ZUxpc3Q7XG4gICAgICAgICAgQXJyYXkuZnJvbSh0YWJzKS5mb3JFYWNoKCh0YWIpID0+IHtcbiAgICAgICAgICAgIGJsb2NrU2l0ZXModGFiLmlkLCB0YWIudXJsLCBzaXRlcywgaXNXaGl0ZUxpc3RpbmcsIHJlZGlyZWN0TGluaywgcmVkaXJlY3RPcHRpb24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KSgpO1xuXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYklkLCBjaGFuZ2VJbmZvKSB7XG4gIGdldFN0b3JhZ2UoXCJzZXR0aW5nc1wiLCBmdW5jdGlvbiAoZGF0YTogYW55KSB7XG4gICAgY29uc3QgeyBpc0Jsb2NraW5nLCBpc1doaXRlTGlzdGluZywgc2l0ZUxpc3QsIHdoaXRlTGlzdFNpdGVzLCByZWRpcmVjdExpbmssIHJlZGlyZWN0T3B0aW9uIH0gPVxuICAgICAgZGF0YS5zZXR0aW5ncztcbiAgICBpZiAoKGlzQmxvY2tpbmcgfHwgaXNXaGl0ZUxpc3RpbmcpICYmIGNoYW5nZUluZm8udXJsKSB7XG4gICAgICBjb25zdCBzaXRlcyA9IGlzV2hpdGVMaXN0aW5nID8gd2hpdGVMaXN0U2l0ZXMgOiBzaXRlTGlzdDtcbiAgICAgIGJsb2NrU2l0ZXModGFiSWQsIGNoYW5nZUluZm8udXJsLCBzaXRlcywgaXNXaGl0ZUxpc3RpbmcsIHJlZGlyZWN0TGluaywgcmVkaXJlY3RPcHRpb24pO1xuICAgIH1cbiAgfSk7XG59KTtcblxuY2hyb21lLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKGZ1bmN0aW9uIChjaGFuZ2VzLCBuYW1lc3BhY2UpIHtcbiAgaWYgKGNoYW5nZXMuc2V0dGluZ3MpIHtcbiAgICBjb25zdCB7IG9sZFZhbHVlLCBuZXdWYWx1ZSB9ID0gY2hhbmdlcy5zZXR0aW5ncztcbiAgICBpZiAob2xkVmFsdWUgJiYgbmV3VmFsdWUpIHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgaXNCbG9ja2luZzogbklzQmxvY2tpbmcsXG4gICAgICAgIHNpdGVMaXN0OiBuU2l0ZUxpc3QsXG4gICAgICAgIGlzV2hpdGVMaXN0aW5nOiBuSXNXaGl0ZUxpc3RpbmcsXG4gICAgICAgIHdoaXRlTGlzdFNpdGVzOiBuV2hpdGVMaXN0U2l0ZXMsXG4gICAgICAgIHJlZGlyZWN0TGluayxcbiAgICAgICAgcmVkaXJlY3RPcHRpb24sXG4gICAgICB9ID0gbmV3VmFsdWU7XG4gICAgICAvLyBUT0RPIGluIGZ1dHVyZSBjYW4gbWFrZSBpdCBwb3NzaWJsZSB0byB0dXJuIG9mZiBibG9jayBzaXRlcyBhbmQgdGhlbiBhbnkgcGFnZSB3b3VsZCBnbyBiYWNrIHRvIHdoYXQgd2FzIG9yaWdpbmFsbHkgc2VhcmNoZWQgKGlmIEkgc2F2ZSBzZWFyY2hlZCB2aWQgcGVyIHRhYiBwcmlvciB0byBibG9ja2luZyBzYWlkIHBhZ2UpXG4gICAgICBjb25zdCBibG9ja0VuYWJsZWQgPSBuSXNCbG9ja2luZyB8fCBuSXNXaGl0ZUxpc3Rpbmc7XG4gICAgICBpZiAoYmxvY2tFbmFibGVkKSB7XG4gICAgICAgIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCBmdW5jdGlvbiAodGFicykge1xuICAgICAgICAgIGNvbnN0IHNpdGVMaXN0ID0gbklzV2hpdGVMaXN0aW5nID8gbldoaXRlTGlzdFNpdGVzIDogblNpdGVMaXN0O1xuICAgICAgICAgIEFycmF5LmZyb20odGFicykuZm9yRWFjaCgodGFiKSA9PiB7XG4gICAgICAgICAgICBibG9ja1NpdGVzKHRhYi5pZCwgdGFiLnVybCwgc2l0ZUxpc3QsIG5Jc1doaXRlTGlzdGluZywgcmVkaXJlY3RMaW5rLCByZWRpcmVjdE9wdGlvbik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cbi8vIG5ldmVyIGJsb2NrIHNpdGVzIHdpdGggdGhlc2UgdGVybXNcbmNvbnN0IGlnbm9yZVNpdGUgPSAodXJsOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgaWdub3JlU2l0ZXMgPSBbXCJjaHJvbWUtZXh0ZW5zaW9uOi8vXCIsIFwiY2hyb21lOlwiXTtcbiAgcmV0dXJuIGlnbm9yZVNpdGVzLnNvbWUoKHNpdGUpID0+IHVybC5pbmRleE9mKHNpdGUpID09PSAwKTtcbn07XG5cbmZ1bmN0aW9uIGJsb2NrU2l0ZXMoXG4gIHRhYklkOiBhbnksXG4gIHVybDogc3RyaW5nLFxuICBzaXRlTGlzdDogc3RyaW5nW10sXG4gIGlzV2hpdGVsaXN0ID0gZmFsc2UsXG4gIHJlZGlyZWN0TGluazogc3RyaW5nLFxuICByZWRpcmVjdE9wdGlvbjogUmVkaXJlY3RFbnVtXG4pIHtcbiAgaWYgKGlnbm9yZVNpdGUodXJsKSkgcmV0dXJuO1xuICBjb25zdCBpc0luTGlzdCA9IHNpdGVMaXN0LmZpbmQoKHNpdGUpID0+IHtcbiAgICByZXR1cm4gdXJsLmluZGV4T2YoXCJodHRwczovL1wiICsgc2l0ZSkgPT09IDAgfHwgdXJsLmluZGV4T2YoXCJodHRwOi8vXCIgKyBzaXRlKSA9PT0gMDtcbiAgfSk7XG4gIGNvbnN0IHNob3VsZEJlQmxvY2tlZCA9IChpc0luTGlzdCAmJiAhaXNXaGl0ZWxpc3QpIHx8ICghaXNJbkxpc3QgJiYgaXNXaGl0ZWxpc3QpO1xuICBpZiAoc2hvdWxkQmVCbG9ja2VkKSB7XG4gICAgLy8gY2FuIEkgcHVzaCB0aGUgY3VycmVudCB1cmwgb250byBoaXN0b3J5IHNvIGl0IGlzbid0IGxvc3QgYmVmb3JlIHJlZGlyZWN0P1xuICAgIGNvbnN0IHVybCA9XG4gICAgICByZWRpcmVjdE9wdGlvbiA9PT0gUmVkaXJlY3RFbnVtLlVSTCAmJiByZWRpcmVjdExpbmtcbiAgICAgICAgPyBcImh0dHBzOi8vXCIgKyByZWRpcmVjdExpbmtcbiAgICAgICAgOiBcIm5vdF9hdmFpbGFibGUvbm90X2F2YWlsYWJsZS5odG1sXCI7XG4gICAgY2hyb21lLnRhYnMudXBkYXRlKHRhYklkLCB7IHVybCB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbnN1cmVTZXR0aW5ncyhkYXRhOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgbGV0IHByZXZTZXR0aW5ncyA9IGRhdGEuc2V0dGluZ3MgfHwge307XG5cbiAgbGV0IHsgaXNCbG9ja2luZywgc2l0ZUxpc3QsIGlzV2hpdGVMaXN0aW5nLCB3aGl0ZUxpc3RTaXRlcywgcmVkaXJlY3RMaW5rLCByZWRpcmVjdE9wdGlvbiB9ID1cbiAgICBwcmV2U2V0dGluZ3M7XG5cbiAgaXNCbG9ja2luZyA9IEJvb2xlYW4oaXNCbG9ja2luZyk7XG4gIGlzV2hpdGVMaXN0aW5nID0gQm9vbGVhbihpc1doaXRlTGlzdGluZyk7XG4gIHNpdGVMaXN0ID0gc2l0ZUxpc3QgPT09IHVuZGVmaW5lZCA/IFtdIDogc2l0ZUxpc3Q7XG4gIHdoaXRlTGlzdFNpdGVzID0gd2hpdGVMaXN0U2l0ZXMgPT09IHVuZGVmaW5lZCA/IFtdIDogd2hpdGVMaXN0U2l0ZXM7XG4gIHJlZGlyZWN0TGluayA9IHJlZGlyZWN0TGluayB8fCBcIlwiO1xuICByZWRpcmVjdE9wdGlvbiA9IHJlZGlyZWN0T3B0aW9uIHx8IFJlZGlyZWN0RW51bS5ERUZBVUxUO1xuICBjb25zdCBzZXR0aW5ncyA9IHtcbiAgICBpc0Jsb2NraW5nLFxuICAgIHNpdGVMaXN0LFxuICAgIGlzV2hpdGVMaXN0aW5nLFxuICAgIHdoaXRlTGlzdFNpdGVzLFxuICAgIHJlZGlyZWN0TGluayxcbiAgICByZWRpcmVjdE9wdGlvbixcbiAgfTtcbiAgLy91cGRhdGUgc3RvcmFnZSB1c2UgdG8gbmV3IHNldCBmdW5jdGlvblxuICBsZXQgbmV3RGF0YSA9IHt9O1xuICBzZXRTdG9yYWdlKFwic2V0dGluZ3NcIiwgeyBzZXR0aW5ncyB9KS50aGVuKChkYXRhKSA9PiB7XG4gICAgbmV3RGF0YSA9IE9iamVjdC5hc3NpZ24obmV3RGF0YSwgZGF0YSk7XG4gICAgY2FsbGJhY2sobmV3RGF0YSk7XG4gIH0pO1xufVxuIiwiZXhwb3J0IGNvbnN0IGdldFN0b3JhZ2UgPSAoa2V5OiBzdHJpbmcsIGNhbGxiYWNrPzogYW55KSA9PiB7XG4gIGNvbnN0IHN0b3JhZ2UgPSBrZXkgPT09IFwic2V0dGluZ3NcIiA/IGNocm9tZS5zdG9yYWdlLnN5bmMgOiBjaHJvbWUuc3RvcmFnZS5sb2NhbDtcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHN0b3JhZ2UuZ2V0KGtleSwgKGRhdGEpID0+IHJlc29sdmUoZGF0YSkpO1xuICB9KTtcbiAgcmV0dXJuIGNhbGxiYWNrID8gcHJvbWlzZS50aGVuKGNhbGxiYWNrKSA6IHByb21pc2U7XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0U3RvcmFnZSA9IChrZXk6IHN0cmluZywgb2JqZWN0OiBhbnksIGNhbGxiYWNrPzogYW55KSA9PiB7XG4gIGNvbnN0IHN0b3JhZ2UgPSBrZXkgPT09IFwic2V0dGluZ3NcIiA/IGNocm9tZS5zdG9yYWdlLnN5bmMgOiBjaHJvbWUuc3RvcmFnZS5sb2NhbDtcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIHN0b3JhZ2Uuc2V0KG9iamVjdCwgKCkgPT4ge1xuICAgICAgc3RvcmFnZS5nZXQoa2V5LCAoZGF0YSkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzb2x2ZShkYXRhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGNhbGxiYWNrID8gcHJvbWlzZS50aGVuKGNhbGxiYWNrKSA6IHByb21pc2U7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U3RvcmFnZUFsbCA9IChrZXlzOiBhbnksIGNhbGxiYWNrPzogYW55KSA9PiB7XG4gIGNvbnN0IHN0b3JhZ2VzS2V5cyA9IGtleXMubWFwKChrZXk6IHN0cmluZykgPT4ge1xuICAgIHJldHVybiB7IGtleSwgc3RvcmFnZTogY2hyb21lLnN0b3JhZ2Vba2V5ID09PSBcInNldHRpbmdzXCIgPyBcInN5bmNcIiA6IFwibG9jYWxcIl0gfTtcbiAgfSk7XG4gIGxldCBwcm9taXNlID0gUHJvbWlzZS5hbGwoXG4gICAgc3RvcmFnZXNLZXlzLm1hcCgoc3RvcmFnZUtleTogYW55KSA9PiB7XG4gICAgICBjb25zdCB7IHN0b3JhZ2UsIGtleSB9ID0gc3RvcmFnZUtleTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzdG9yYWdlLmdldChrZXksIChkYXRhOiBhbnkpID0+IHJlc29sdmUoZGF0YSkpO1xuICAgICAgfSk7XG4gICAgfSlcbiAgKS50aGVuKChyZXMpID0+IHtcbiAgICBjb25zdCBkYXRhID0ge30gYXMgYW55O1xuICAgIHJlcy5mb3JFYWNoKChpdGVtLCBpZHgpID0+IChkYXRhW2tleXNbaWR4XV0gPSBpdGVtW2tleXNbaWR4XV0pKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfSk7XG4gIHJldHVybiBjYWxsYmFjayA/IHByb21pc2UudGhlbihjYWxsYmFjaykgOiBwcm9taXNlO1xufTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL2JhY2tncm91bmQvaW5kZXgudHNcIik7XG4iXSwic291cmNlUm9vdCI6IiJ9