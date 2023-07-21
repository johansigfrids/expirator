"use strict";

import { factor, redline } from './constants.js';

export default function updateBadge(tabId, securityInfo) {
  if (securityInfo.isUntrusted || (securityInfo.state !== "secure" && securityInfo.state !== "weak") || securityInfo.certificates.length === 0) {
    browser.browserAction.setIcon({
      path: '/icons/open-lock.svg',
      tabId: tabId,
    });
    return;
  }
  const cert = securityInfo.certificates[0];
  const diff = cert.validity.end - new Date().getTime();
  const diffDays = Math.floor(diff / factor);
  browser.browserAction.setBadgeBackgroundColor({
    color: diffDays < redline ? '#D92626' : '#262626',
    tabId: tabId,
  });
  browser.browserAction.setBadgeTextColor({
    color: 'white',
    tabId: tabId,
  });
  browser.browserAction.setBadgeText({
    text: diffDays.toString(),
    tabId: tabId,
  });
  browser.browserAction.setIcon({
    path: diffDays < redline ? '/icons/red-lock.svg' : '/icons/green-lock.svg',
    tabId: tabId,
  });
}

export function resetBadge(tabId) {
  browser.browserAction.setBadgeText({
    text: null,
    tabId: tabId,
  });
  browser.browserAction.setIcon({
    path: '/icons/grey-lock.svg',
    tabId: tabId,
  });
}