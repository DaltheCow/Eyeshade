"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const log = (...messages) => {
    chrome.runtime.sendMessage({ action: "log", messages });
};
exports.log = log;
//# sourceMappingURL=logger.js.map