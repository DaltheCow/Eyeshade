export const log = (...messages) => {
  chrome.runtime.sendMessage({ action: 'log', messages });
};
