/*
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features

  const isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          const installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Your custom JavaScript goes here

  // Bacon cloning
  document.querySelector('#overview button').addEventListener('click', (evt) => {
    // Clone the next node of the button's parent, which is our bacon section
    const baconCopy = evt.target.parentNode.nextElementSibling.cloneNode(true);
    // Insert a new bacon section by appending it to the parent of all bacons
    document.getElementById('overview').appendChild(baconCopy);
  });

  // Adds dashes every 4 digits to credit card input
  const dashAdder = (e) => {
    e.target.value = e.target.value.replace(/-/g, '');
    e.target.value = e.target.value.replace(/(.{4})/g, '$1-');
    e.target.value = e.target.value.replace(/-$/, '');
  };
  document.getElementById('credit').addEventListener('keypress', dashAdder);
  document.getElementById('credit').addEventListener('change', dashAdder);

  // Handles submit button click
  document.getElementById('complete_button').addEventListener('click', () => {
    // key = DOM element ID, reg = expression to check on the input, msg = message to display on error
    const validators = {
      fname: {
        reg: /^[a-z]+$/gi,
        msg: 'The first name can only contain letters.',
      },
      lname: {
        reg: /^[a-z]+$/gi,
        msg: 'The last name can only contain letters.',
      },
      email: {
        reg: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
        msg: 'The provided email is invalid.',
      },
      postal: {
        reg: /^\d{2}-?\d{3}$/,
        msg: 'The postal code must be in XX-XXX or XXXXX numeric format.',
      },
      phone: {
        reg: /^\(?\+?\d{1,3}\)?(\s|-)?\d{2,4}(\s|-)?\d{2,3}(\s|-)?\d{2,3}$/,
        msg: 'Invalid phone number provided.',
      },
      credit: {
        reg: /^\d{4}-\d{4}-\d{4}-\d{4}$/,
        msg: 'Invalid credit card number!',
      },
      credit_code: {
        reg: /^\d{3}$/,
        msg: 'Invalid card security code.',
      },
      exp_date: {
        reg: /^(\d{1,2})\/(\d{2})$/,
        msg: 'Invalid expiration date. The correct format is: MM/YY',
      },
    };

    // Stores list of errors to display after validation
    const errorsList = [];

    // Checks every element from validators
    Object.keys(validators).forEach((key, i) => {
      const el = document.getElementById(key);
      if (!validators[key].reg.test(el.value.trim())) {
        el.parentNode.classList.add('invalid');
        errorsList.push(validators[key].msg);
      } else {
        el.parentNode.classList.remove('invalid');
      }
    });


    // Check if card is already expired by comparing current date to expiration date
    const expDateValue = document.getElementById('exp_date').value;
    if (validators.exp_date.reg.test(expDateValue)) {
      const now = new Date();
      const currentYear = parseInt(now.getFullYear().toString().substring(2), 10);
      const currentMonth = now.getMonth() + 1;
      const eneteredMonth = parseInt(validators.exp_date.reg.exec(expDateValue)[1], 10);
      const enteredYear = parseInt(validators.exp_date.reg.exec(expDateValue)[2], 10);

      if (enteredYear < currentYear || eneteredMonth < currentMonth && enteredYear === currentYear) {
        errorsList.push('Your card is expired. Make sure you entered valid expiration date.');
        document.getElementById('exp_date').parentNode.classList.add('invalid');
      } else {
        document.getElementById('exp_date').parentNode.classList.remove('invalid');
      }
    }

    const errorMessageDiv = document.getElementById('error_message');
    const successMessageDiv = document.getElementById('success_message');
    if (!errorsList.length) { // No errors, show success message
      errorMessageDiv.style.display = 'none';
      errorMessageDiv.textContent = '';
      successMessageDiv.style.display = 'block';
    } else {
      successMessageDiv.style.display = 'none';
      errorMessageDiv.style.display = 'block';
      // Show all errors in a list
      errorMessageDiv.innerHTML = `<ul>${errorsList.map((error) => `<li>${error}</li>`).join('')}</ul>`;
    }
  });
})();
