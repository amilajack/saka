import 'lib/browser_polyfill.js';

// list of tab ids in order of increasing age since last visit
const tabHistory = [];

const log = listener => (...args) => {
  listener(...args);
  // if (SAKA_DEBUG) console.log(tabHistory);
};

function setMostRecentTab(tabId) {
  const i = tabHistory.indexOf(tabId);
  if (i !== -1) {
    tabHistory.splice(i, 1);
  }
  tabHistory.unshift(tabId);
}

browser.tabs.onActivated.addListener(
  log(({ tabId }) => {
    setMostRecentTab(tabId);
  })
);

browser.tabs.onRemoved.addListener(
  log(tabId => {
    const i = tabHistory.indexOf(tabId);
    tabHistory.splice(i, 1);
  })
);

browser.tabs.onReplaced.addListener(
  log((addedTabId, removedTabId) => {
    const i = tabHistory.indexOf(removedTabId);
    tabHistory[i] = addedTabId;
  })
);

browser.windows.onFocusChanged.addListener(async windowId => {
  const [tab] = await browser.tabs.query({ currentWindow: true, active: true });
  if (tab && tab.windowId === windowId) {
    setMostRecentTab(tab.id);
  }
});

export default tabHistory;
