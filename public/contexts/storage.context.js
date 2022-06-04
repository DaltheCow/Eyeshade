"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStorageContext = exports.StorageProvider = void 0;
require("background");
const React = __importStar(require("react"));
const storage_1 = require("../modules/storage");
const index_1 = require("../background/index");
const Context = React.createContext({
    isLoaded: false,
    dataStorage: {},
    deleteLink: (url) => { },
    deleteWhiteListLink: (url) => { },
    setToggles: (fields) => { },
    addSite: (url) => { },
    addWhiteListSite: (url) => __awaiter(void 0, void 0, void 0, function* () { return new Promise(null); }),
    updateRedirectLink: (url) => __awaiter(void 0, void 0, void 0, function* () { }),
    updateRedirectOption: (redirectOption) => { },
});
var FieldUpdateEnum;
(function (FieldUpdateEnum) {
    FieldUpdateEnum["UPDATE_REDIRECT_OPTION"] = "update redirectOption";
    FieldUpdateEnum["UPDATE_REDIRECT_LINK"] = "update redirectLink";
    FieldUpdateEnum["ADD_TO_SITELIST"] = "add to siteList";
    FieldUpdateEnum["UPDATE_IS_BLOCKING"] = "update isBlocking";
    FieldUpdateEnum["UPDATE_IS_WHITELISTING"] = "update isWhiteListing";
    FieldUpdateEnum["REMOVE_FROM_WHITELIST"] = "remove from whitelist";
})(FieldUpdateEnum || (FieldUpdateEnum = {}));
const StorageProvider = ({ children }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [dataStorage, setDataStorage] = React.useState({});
    React.useEffect(() => {
        (0, storage_1.getStorageAll)(["settings"]).then((data) => {
            const { settings } = data;
            const { isBlocking, siteList, isWhiteListing, whiteListSites, redirectLink, redirectOption } = settings;
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
        const listenerFunc = (changes) => {
            if (changes["settings"]) {
                const { oldValue, newValue } = changes.settings;
                const fields = [
                    "isBlocking",
                    "siteList",
                    "isWhiteListing",
                    "whiteListSites",
                    "redirectLink",
                    "redirectOption",
                ];
                while (JSON.stringify(oldValue[fields[0]]) === JSON.stringify(newValue[fields[0]])) {
                    fields.shift();
                }
                setDataStorage(Object.assign(Object.assign({}, dataStorage), { [fields[0]]: newValue[fields[0]] }));
            }
        };
        chrome.storage.onChanged.addListener(listenerFunc);
        return () => chrome.storage.onChanged.removeListener(listenerFunc);
    }, [dataStorage]);
    const setToggles = (fields) => __awaiter(void 0, void 0, void 0, function* () {
        for (let prop in fields) {
            let fieldUpdate = prop === "isBlocking"
                ? FieldUpdateEnum.UPDATE_IS_BLOCKING
                : FieldUpdateEnum.UPDATE_IS_WHITELISTING;
            if (prop === "isBlocking" || prop === "isWhiteListing") {
                yield conflictHandler(fieldUpdate, fields[prop]);
            }
        }
        (0, storage_1.getStorage)("settings", (data) => {
            const settings = Object.assign(Object.assign({}, data.settings), fields);
            console.log("🚀 ~ file: storage.context.tsx ~ line 87 ~ getStorage ~ settings", settings);
            (0, storage_1.setStorage)("settings", { settings }, () => {
                setDataStorage(settings);
            });
        });
    });
    const addSite = (url) => __awaiter(void 0, void 0, void 0, function* () {
        yield conflictHandler(FieldUpdateEnum.ADD_TO_SITELIST, url);
        (0, storage_1.getStorage)("settings", (data) => {
            const oldSiteList = data.settings.siteList;
            if (!oldSiteList.includes(url)) {
                const settings = Object.assign(Object.assign({}, data.settings), { siteList: data.settings.siteList.concat(url) });
                (0, storage_1.setStorage)("settings", { settings }, () => {
                    setDataStorage(settings);
                });
            }
        });
    });
    const addWhiteListSite = (url) => __awaiter(void 0, void 0, void 0, function* () {
        return (0, storage_1.getStorage)("settings", (data) => {
            const whiteListSites = data.settings.whiteListSites;
            if (!whiteListSites.includes(url)) {
                const settings = Object.assign(Object.assign({}, data.settings), { whiteListSites: data.settings.whiteListSites.concat(url) });
                (0, storage_1.setStorage)("settings", { settings }, () => {
                    setDataStorage(settings);
                });
            }
        });
    });
    const updateRedirectLink = (url) => __awaiter(void 0, void 0, void 0, function* () {
        yield conflictHandler(FieldUpdateEnum.UPDATE_REDIRECT_LINK, url);
        (0, storage_1.getStorage)("settings", (data) => {
            const settings = Object.assign(Object.assign({}, data.settings), { redirectLink: url });
            (0, storage_1.setStorage)("settings", { settings });
        });
    });
    const deleteLink = (url) => {
        (0, storage_1.getStorage)("settings", (data) => {
            let { siteList } = data.settings;
            siteList = siteList.filter((siteURL) => siteURL !== url);
            let settings = Object.assign({}, data.settings, { siteList });
            (0, storage_1.setStorage)("settings", { settings });
        });
    };
    const deleteWhiteListLink = (url) => __awaiter(void 0, void 0, void 0, function* () {
        yield conflictHandler(FieldUpdateEnum.REMOVE_FROM_WHITELIST, url);
        (0, storage_1.getStorage)("settings", (data) => {
            let { whiteListSites } = data.settings;
            whiteListSites = whiteListSites.filter((siteURL) => siteURL !== url);
            let settings = Object.assign({}, data.settings, { whiteListSites });
            (0, storage_1.setStorage)("settings", { settings });
        });
    });
    const updateRedirectOption = (redirectOption) => __awaiter(void 0, void 0, void 0, function* () {
        yield conflictHandler(FieldUpdateEnum.UPDATE_REDIRECT_OPTION, redirectOption);
        (0, storage_1.getStorage)("settings", (data) => {
            let settings = Object.assign({}, data.settings, { redirectOption });
            (0, storage_1.setStorage)("settings", { settings });
        });
    });
    const isStartingStringMatch = (str1, str2) => {
        return str1 && str2 && (str1.indexOf(str2) === 0 || str2.indexOf(str1) === 0);
    };
    const hasConflictWithWhitelist = (redirectLink, whitelistSites) => {
        return (redirectLink &&
            whitelistSites.every((url) => !isStartingStringMatch(url, redirectLink)));
    };
    const hasConflictWithBlocklist = (redirectLink, blockListSites) => {
        return redirectLink && blockListSites.some((url) => isStartingStringMatch(url, redirectLink));
    };
    const conflictHandler = (action, value) => __awaiter(void 0, void 0, void 0, function* () {
        const { isBlocking, isWhiteListing, siteList, whiteListSites, redirectLink, redirectOption } = dataStorage;
        switch (action) {
            case FieldUpdateEnum.UPDATE_REDIRECT_OPTION: {
                if (value === index_1.RedirectEnum.URL && redirectLink) {
                    if (hasConflictWithWhitelist(redirectLink, whiteListSites) && isWhiteListing) {
                        yield addWhiteListSite(redirectLink);
                        // add notification "we added <url> to your whitelist"
                    }
                    if (hasConflictWithBlocklist(redirectLink, siteList) && isBlocking) {
                        alert(`Your redirect website could cause issues. You have ${redirectLink} as your redirect website and that website is also in your block list`);
                    }
                }
                break;
            }
            case FieldUpdateEnum.UPDATE_REDIRECT_LINK: {
                if (redirectOption === index_1.RedirectEnum.URL) {
                    if (hasConflictWithWhitelist(value, whiteListSites) && isWhiteListing) {
                        yield addWhiteListSite(value);
                        // add notification "we added <url> to your whitelist"
                    }
                    if (hasConflictWithBlocklist(value, siteList) && isBlocking) {
                        alert(`Using this redirect website could cause issues. This website is also in your block list`);
                    }
                }
                break;
            }
            case FieldUpdateEnum.ADD_TO_SITELIST: {
                if (redirectOption === index_1.RedirectEnum.URL &&
                    isStartingStringMatch(value, redirectLink) &&
                    isBlocking) {
                    alert(`Adding this site could cause issues. You have ${redirectLink} as your redirect website`);
                }
                break;
            }
            case FieldUpdateEnum.UPDATE_IS_BLOCKING: {
                if (redirectOption === index_1.RedirectEnum.URL &&
                    value &&
                    hasConflictWithBlocklist(redirectLink, siteList)) {
                    alert(`Activating blocking could cause issues. You have ${redirectLink} as your redirect website and that website is also in your block list`);
                }
                break;
            }
            case FieldUpdateEnum.UPDATE_IS_WHITELISTING: {
                if (redirectOption === index_1.RedirectEnum.URL &&
                    value &&
                    hasConflictWithWhitelist(redirectLink, whiteListSites)) {
                    yield addWhiteListSite(redirectLink);
                    // add notification "we added <url> to your whitelist"
                }
                break;
            }
            case FieldUpdateEnum.REMOVE_FROM_WHITELIST: {
                if (redirectOption === index_1.RedirectEnum.URL &&
                    isWhiteListing &&
                    isStartingStringMatch(value, redirectLink)) {
                    alert(`Removing this from the whitelist could cause issues. You have ${redirectLink} as your redirect website`);
                }
                break;
            }
            default:
                return;
        }
    });
    return (React.createElement(Context.Provider, { value: {
            isLoaded,
            dataStorage,
            deleteLink,
            deleteWhiteListLink,
            setToggles,
            addSite,
            addWhiteListSite,
            updateRedirectLink,
            updateRedirectOption,
        } }, children));
};
exports.StorageProvider = StorageProvider;
const useStorageContext = () => {
    return React.useContext(Context);
};
exports.useStorageContext = useStorageContext;
//# sourceMappingURL=storage.context.js.map