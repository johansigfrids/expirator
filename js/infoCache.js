"use strict";

import {factor} from './constants.js';

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
      const tabs = await browser.tabs.query({url: `*://${key}/*`});
      if (tabs.length === 0) {
        infoMap.delete(key);
      }
    }
  }
}

export function setInfo(requestDomain, securityInfo) {
  infoMap.set(requestDomain, toCacheFormat(securityInfo));
}

export function getInfo(key) {
  return infoMap.get(key);
};

setInterval(cleanupGarbage, 1000 * 60 * 60);
