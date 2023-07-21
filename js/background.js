"use strict";

import updateBadge from './updateBadge.js';
import { factor } from './constants.js';
import { getInfo, setInfo } from './infoCache.js';

window.getInfo = getInfo;

async function logCert(details) {
  try {
    const requestDomain = new URL(details.url).hostname;
    const now = new Date().getTime();
    const data = getInfo(requestDomain);
    if (!data || data.cacheTime + factor / 2 < now) {
      const securityInfo = await browser.webRequest.getSecurityInfo(
        details.requestId,
        { "certificateChain": true }
      );
      setInfo(requestDomain, securityInfo);
    }
  }
  catch (error) {
    console.error(error);
  }
}

async function updateTab(tabId, changeInfo, tab) {
  try {
    if (changeInfo.status !== 'complete') {
      return;
    }
    if (!tab.url) {
      return;
    }
    const tabDomain = new URL(tab.url).hostname;
    const securityInfo = getInfo(tabDomain)
    if (!securityInfo) {
      return;
    }
    updateBadge(tabId, securityInfo);
  }
  catch (error) {
    console.error(error);
  }
}

browser.webRequest.onHeadersReceived.addListener(logCert,
  { urls: ["<all_urls>"] },
  ["blocking"]
);

browser.tabs.onUpdated.addListener(updateTab, {
  properties: ['status'],
});
