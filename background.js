"use strict";

const factor = 1000 * 60 * 60 * 24;
const redline = 29;
const infoMap = new Map();

function cleanupGarbage() {
  let now = new Date().getTime();
  for (let [key, value] of infoMap) {
    if (value.cacheTime + factor < now) {
      infoMap.delete(key);
    }
  }
}

setInterval(cleanupGarbage, 1000 * 60 * 60);

async function getSecurityInfo(requestId, requestDomain) {
  let now = new Date().getTime();
  if (!infoMap.has(requestDomain)) {
    let securityInfo = await browser.webRequest.getSecurityInfo(
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
    let tab = await browser.tabs.get(details.tabId);
    if (!tab.url) {
      return;
    }
    let tabDomain = new URL(tab.url).hostname;
    let requestDomain = new URL(details.url).hostname;
    if (tabDomain !== requestDomain) {
      return;
    }
    let securityInfo = await getSecurityInfo(details.requestId, requestDomain);
    if (securityInfo.isUntrusted || securityInfo.state !== "secure" && securityInfo.state !== "weak") {
      browser.browserAction.setIcon({
        path: 'icons/open-lock.svg',
        tabId: details.tabId,
      });
      return;
    }
    let cert = securityInfo.certificates[0];
    let diff = new Date(cert.validity.end) - new Date();
    let diffDays = Math.floor(diff / factor);
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