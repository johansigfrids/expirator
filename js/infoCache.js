"use strict";

import { factor, gcInterval } from './constants.js';

const infoMap = new Map();

function toCacheFormat(securityInfo) {
  return {
    cacheTime: new Date().getTime(),
    isUntrusted: securityInfo.isUntrusted,
    state: securityInfo.state,
    certificates: (securityInfo.certificates || []).map(cert => ({
      subject: cert.subject,
      issuer: cert.issuer,
      validity: {
        start: cert.validity.start,
        end: cert.validity.end,
      },
    })),
  };
}

async function cleanupGarbage() {
  const now = new Date().getTime();
  for (let [key, value] of infoMap) {
    if (value.cacheTime + factor < now) {
      const tabs = await browser.tabs.query({ url: `${key}/*` });
      if (tabs.length === 0) {
        clearInfo(key);
      }
    }
  }
}

export function setInfo(key, securityInfo) {
  infoMap.set(key, toCacheFormat(securityInfo));
}

export function getInfo(key) {
  return infoMap.get(key);
};

export function clearInfo(key) {
  infoMap.delete(key);
}

setInterval(cleanupGarbage, gcInterval);
