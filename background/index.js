import { getStorage, setStorage, getStorageAll } from "../modules/storage";

chrome.tabs.query({}, function(tabs) {
  Array.from(tabs).forEach(tab => {
    chrome.pageAction.show(tab.id);
  });
});

(function() {
  getStorageAll(['settings'])
  .then(data => {
    ensureSettings(data, (newData) => {
      if (newData.settings.isBlocking) {
        chrome.tabs.query({}, function(tabs) {
          Array.from(tabs).forEach(tab => {
            blockSites(tab.id, tab.url, newData.settings.siteList);
          });
        });
      }
    });
  });
})();

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
    chrome.pageAction.show(tabId);
    getStorage('settings', function(data) {
      if (data.settings.isBlocking && changeInfo.url) {
        blockSites(tabId, changeInfo.url, data.settings.siteList);
      }
  });
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.settings) {
    const { oldValue, newValue } = changes.settings;
    
    if (oldValue && newValue) {
      const {
        isBlocking: oIsBlocking,
        siteList: oSiteList
      } = oldValue;
      const {
        isBlocking: nIsBlocking,
        siteList: nSiteList
      } = newValue;
      const blockEnabled = !oIsBlocking && nIsBlocking,
            siteAdded = oSiteList.length < nSiteList.length,
            blockVids = (blockEnabled) || (nIsBlocking && siteAdded);
      if (blockVids) {
        chrome.tabs.query({}, function(tabs) {
          Array.from(tabs).forEach(tab => {
            blockSites(tab.id, tab.url, nSiteList);
          });
        });
      }
    }
  }
});

function blockSites(tabId, url, siteList) {
  const doesMatch = siteList.filter(site => {
    return url.indexOf("https://" + site) === 0 || url.indexOf("http://" + site) === 0
  }).length > 0;
  if (doesMatch) {
    chrome.tabs.update(tabId, {url: 'not_available/not_available.html'});
  }
}

function ensureSettings(data, callback) {
  let prevSettings = data.settings || {};

  let { isBlocking, siteList } = prevSettings;

  isBlocking = Boolean(isBlocking);
  siteList = siteList === undefined ? [] : siteList;
  const settings = { isBlocking, siteList };
  //update storage use to new set function
  let newData = {};
  setStorage('settings', { settings }).then(data => {
    newData = Object.assign(newData, data);
    callback(newData);
  });
}