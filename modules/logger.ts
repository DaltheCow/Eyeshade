export const log = (...messages: any) => {
  chrome.runtime.sendMessage({ action: "log", messages });
};
