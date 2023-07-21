
"use strict";

import { factor } from './constants.js';
import parser from './parser.js';

export default function renderPopup(root, certificates, tabOrigin) {
  const fragment = new DocumentFragment();
  const header = document.createElement('h1');
  header.classList.add('header');
  header.textContent = 'Certificate chain';
  fragment.appendChild(header);

  const tabDomain = new URL(tabOrigin).hostname
  const hostname = document.createElement('h3');
  hostname.classList.add('hostname');
  hostname.textContent = tabDomain;
  fragment.appendChild(hostname);

  for (const cert of certificates) {
    const container = renderCert(cert);
    fragment.appendChild(container);
  }
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