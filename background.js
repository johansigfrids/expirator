"use strict";

const factor = 1000 * 60 * 60 * 24;
const redline = 29;
const infoMap = new Map();

function getInfo(key) {
  return infoMap.get(key);
}

async function cleanupGarbage() {
  const now = new Date().getTime();
  for (let [key, value] of infoMap) {
    if (value.cacheTime + factor < now) {
      const tabs = await browser.tabs.query({url: `*://${key}/*`});
      if (tabs.length === 0) {
        infoMap.delete(key);
      }
    }
  }
}

setInterval(cleanupGarbage, 1000 * 60 * 60);

async function getSecurityInfo(requestId, requestDomain) {
  const now = new Date().getTime();
  const data = infoMap.get(requestDomain);
  if (!data || data.cacheTime + factor < now) {
    const securityInfo = await browser.webRequest.getSecurityInfo(
      requestId,
      {"certificateChain": true}
    );
    infoMap.set(requestDomain, {
      cacheTime: now,
      info: securityInfo,
    });
  }
  return infoMap.get(requestDomain).info;
}

async function logCert(details) {
  try {
    if (details.tabId === -1) {
      return;
    }
    const tab = await browser.tabs.get(details.tabId);
    if (!tab.url) {
      return;
    }
    const tabDomain = new URL(tab.url).hostname;
    const requestDomain = new URL(details.url).hostname;
    if (tabDomain !== requestDomain) {
      return;
    }
    const securityInfo = await getSecurityInfo(details.requestId, requestDomain);
    if (securityInfo.isUntrusted || securityInfo.state !== "secure" && securityInfo.state !== "weak") {
      browser.browserAction.setIcon({
        path: 'icons/open-lock.svg',
        tabId: details.tabId,
      });
      return;
    }
    const cert = securityInfo.certificates[0];
    const diff = cert.validity.end - new Date().getTime();
    const diffDays = Math.floor(diff / factor);
    browser.browserAction.setBadgeBackgroundColor({
      color: diffDays < redline ? '#D92626' : '#262626',
      tabId: details.tabId,
    });
    browser.browserAction.setBadgeTextColor({
      color: 'white',
      tabId: details.tabId,
    });
    browser.browserAction.setBadgeText({
      text: diffDays.toString(),
      tabId: details.tabId,
    });
    browser.browserAction.setIcon({
      path: diffDays < redline ? 'icons/red-lock.svg' : 'icons/green-lock.svg',
      tabId: details.tabId,
    });
  }
  catch(error) {
    console.error(error);
  }
}

browser.webRequest.onHeadersReceived.addListener(logCert,
  {urls: ["<all_urls>"]},
  ["blocking"]
);