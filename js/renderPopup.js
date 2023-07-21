
"use strict";

import { factor } from './constants.js';
import { resetBadge } from './updateBadge.js';
import parser from './parser.js';

const clearInfo = browser.extension.getBackgroundPage().window.clearInfo;

export default function renderPopup(root, securityInfo, tabOrigin, tabId) {
  const fragment = new DocumentFragment();

  if (securityInfo.isUntrusted || (securityInfo.state !== "secure" && securityInfo.state !== "weak") || securityInfo.certificates.length === 0) {
    const notSecure = document.createElement('p');
    notSecure.textContent = 'This page is not secure';
    fragment.appendChild(notSecure);
  } else {
    const header = document.createElement('h1');
    header.classList.add('header');
    header.textContent = 'Certificate chain';
    fragment.appendChild(header);

    const tabDomain = new URL(tabOrigin).hostname
    const hostname = document.createElement('h3');
    hostname.classList.add('hostname');
    hostname.textContent = tabDomain;
    fragment.appendChild(hostname);
    for (const cert of securityInfo.certificates) {
      const container = renderCert(cert);
      fragment.appendChild(container);
    }
  }

  function clear() {
    clearInfo(tabOrigin);
    const span = document.createElement('span');
    span.textContent = ` Cache cleared for ${tabOrigin}`;
    root.appendChild(span);
    resetBadge(tabId);
  }
  const clearButton = document.createElement('button');
  clearButton.classList.add('clear');
  clearButton.textContent = 'Clear cache';
  clearButton.onclick = clear
  fragment.appendChild(clearButton);

  root.innerHTML = '';
  root.appendChild(fragment);
}

function renderCert(cert) {
  let diff = cert.validity.end - new Date().getTime();
  let diffDays = Math.floor(diff / factor);
  if (diffDays < 0) {
    console.log(cert);
  }

  const container = document.createElement('div');
  container.classList.add('cert');

  const subjectLabel = document.createElement('div');
  subjectLabel.classList.add('subject-label');
  subjectLabel.textContent = 'Subject:';
  container.appendChild(subjectLabel);

  const subject = document.createElement('div');
  subject.classList.add('subject');
  subject.textContent = extractName(cert.subject);
  subject.title = cert.subject;
  container.appendChild(subject);

  const issuerLabel = document.createElement('div');
  issuerLabel.classList.add('issuer-label');
  issuerLabel.textContent = 'Issuer:';
  container.appendChild(issuerLabel);

  const issuer = document.createElement('div');
  issuer.classList.add('issuer');
  issuer.textContent = extractName(cert.issuer);
  issuer.title = cert.issuer;
  container.appendChild(issuer);

  const startDateLabel = document.createElement('div');
  startDateLabel.classList.add('start-date-label');
  startDateLabel.textContent = 'Issue date:';
  container.appendChild(startDateLabel);

  const startDate = document.createElement('div');
  startDate.classList.add('start-date');
  startDate.textContent = new Date(cert.validity.start).toDateString();
  startDate.title = new Date(cert.validity.start).toISOString();
  container.appendChild(startDate);

  const endDateLabel = document.createElement('div');
  endDateLabel.classList.add('end-date-label');
  endDateLabel.textContent = 'Expiration date:';
  container.appendChild(endDateLabel);

  const endDate = document.createElement('div');
  endDate.classList.add('end-date');
  endDate.textContent = new Date(cert.validity.end).toDateString();
  endDate.title = new Date(cert.validity.end).toISOString();
  container.appendChild(endDate);

  const daysLeftLabel = document.createElement('div');
  daysLeftLabel.classList.add('days-left-label');
  daysLeftLabel.textContent = 'Days left:';
  container.appendChild(daysLeftLabel);

  const daysLeft = document.createElement('div');
  daysLeft.classList.add('days-left-date');
  daysLeft.textContent = diffDays.toString();
  container.appendChild(daysLeft);

  return container;
}

function extractName(text) {
  const result = parser(text);
  if (result['O']) {
    return result['O'];
  }
  return result['CN'];
}