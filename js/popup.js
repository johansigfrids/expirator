"use strict";

import renderPopup from './renderPopup.js';
import updateBadge from './updateBadge.js';

const getInfo = browser.extension.getBackgroundPage().window.getInfo;

async function main() {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  if (!tabs.length) {
    return;
  }
  const tab = tabs[0];
  if (!tab.url) {
    return;
  }
  const tabOrigin = new URL(tab.url).origin;
  const securityInfo = getInfo(tabOrigin);
  if (!securityInfo) {
    return;
  }
  const root = document.querySelector('.root');
  renderPopup(root, securityInfo, tabOrigin, tab.id);
  updateBadge(tab.id, securityInfo)
}


main();