// ==UserScript==
// @name         AutoDebank
// @namespace    http://t.me/lqcrypto
// @version      1.1
// @description  Automates Debank activities.
// @author       local
// @match        https://debank.com/*
// @grant        none
// ==/UserScript==

(function () {
  let isRunning = false;
  let enableAutoJoin = true;
  let delayBetweenActions = 1000;
  let enableAutoUnfollower = false;
  let totalUnfollows = 0;
  let totalLuckyDrawJoined = 0;

  function getTotalUnfollows() {
    return totalUnfollows;
  }

  function toggleAutoUnfollower(event) {
    enableAutoUnfollower = event.target.checked;
    localStorage.setItem('enableAutoUnfollower', enableAutoUnfollower);

    // Update the UI with the current value of totalUnfollows
    document.getElementById('totalUnfollows').textContent = totalUnfollows;
  }

  function clickButtonByClassName(className) {
    const button = document.querySelector(`button.${className}`);
    if (button) {
      button.click();
    }
  }

  function waitForStateChange(target, expectedText) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (target.textContent.includes(expectedText)) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  }

  function wait(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  async function autoUnfollow() {
    const followingButtons = document.querySelectorAll('.FollowButton_follwing__2itpB');
    for (const button of followingButtons) {
      if (button.textContent === 'Following') { // Check if the button text is 'Following'
        button.click();
        await wait(delayBetweenActions);
        totalUnfollows++;
      }
    }
    const nextPageButton = document.querySelector('.ant-pagination-next a');
    if (nextPageButton) {
      nextPageButton.click();
      await wait(2500); // Wait for the next page to load (adjust the delay as needed)
      await autoUnfollow();
    }
    // Update totalUnfollows in the UI
    document.getElementById('totalUnfollows').textContent = totalUnfollows;
  }

  async function clickButtons() {
    while (isRunning) {
      // Find and click "Join the Draw" button
      let joinTheDrawButton;
      do {
        joinTheDrawButton = document.querySelector('button.RichTextView_joinBtn__3dHYH');
        if (!joinTheDrawButton) {
          window.scrollBy(0, 500);
          await wait(500);
        }
      } while (!joinTheDrawButton);

      await wait(1000); // Additional delay before clicking
      joinTheDrawButton.click();

      // Click "Follow" or "Followed" button and wait for a short delay
      clickButtonByClassName('FollowButton_followBtn__DtOgj');
      await wait(1500);

      // Wait for "Follow" or "Followed" buttons to appear
      await waitForStateChange(document.body, 'Following');

      // Check if "Not qualified" message is present
      const notQualifiedMessage = document.querySelector('div.JoinDrawModal_inValidTag__3Sfee');
      if (notQualifiedMessage && notQualifiedMessage.textContent === 'Not qualified') {
        // Close the Lucky Draw window
        const closeButton = document.querySelector('img.CommonModal_closeModalButton__1swng');
        if (closeButton) {
          closeButton.click();
        }
      } else {
        // Click "Join the Lucky Draw" button
        clickButtonByClassName('JoinDrawModal_submitBtn__RJXvp');
      }

      // Scroll to the next Lucky Draw
      window.scrollBy(0, 500);

      // Wait for the next cycle
      await wait(delayBetweenActions);

      totalLuckyDrawJoined++
      document.getElementById('totalLuckyDrawJoined').textContent = totalLuckyDrawJoined;
    }
  }


  async function autoUnfollowerLoop() {
    while (isRunning) {
      if (enableAutoUnfollower) {
        await autoUnfollow();
      }
    }
  }

  function start() {
    if (!isRunning) {
      isRunning = true;
      if (enableAutoJoin) {
        clickButtons();
      }
      if (enableAutoUnfollower) {
        autoUnfollowerLoop();
      }
    }
  }


  function stop() {
    isRunning = false;
  }

  function toggleAutoJoin(event) {
    enableAutoJoin = event.target.checked;
    localStorage.setItem('enableAutoJoin', enableAutoJoin);

    // Update the UI with the current value of totalLuckyDrawJoined
    document.getElementById('totalLuckyDrawJoined').textContent = totalLuckyDrawJoined;

    if (enableAutoJoin && isRunning) {
      clickButtons();
    }
  }

  function setDelay(event) {
    delayBetweenActions = event.target.value;
    localStorage.setItem('delayBetweenActions', delayBetweenActions);
  }

  // Restore user preferences from localStorage
  if (localStorage.getItem('enableAutoJoin')) {
    enableAutoJoin = localStorage.getItem('enableAutoJoin') === 'true';
  }

  if (localStorage.getItem('delayBetweenActions')) {
    delayBetweenActions = parseInt(localStorage.getItem('delayBetweenActions'));
  }

  // Create the user interface
  const menuHTML = `
    <div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; background: #fff; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div>
          <button style="padding: 8px 16px; background: #4caf50; color: #fff; border: none; border-radius: 5px; cursor: pointer;" id="startButton">Start</button>
          <button style="padding: 8px 16px; background: #f44336; color: #fff; border: none; border-radius: 5px; cursor: pointer;" id="stopButton">Stop</button>
        </div>
        <div style="display: flex; align-items: center;">
          <a style="margin-right: 10px;">Enable Auto Join</a>
          <label class="switch">
            <input type="checkbox" id="autoJoinToggle" checked>
            <span class="slider round"></span>
          </label>
        </div>
      </div>
      <div style="display: flex; align-items: center;">
        <a style="margin-right: 10px;">Auto Unfollower</a>
        <label class="switch">
          <input type="checkbox" id="autoUnfollowerToggle">
          <span class="slider round"></span>
        </label>
      </div>
      <div style="margin-top: 10px;">
        <label style="font-size: 14px;">Delay between actions (ms):</label>
        <input type="number" min="500" value="${delayBetweenActions}" id="delayInput" style="margin-top: 5px;">
      </div>
      <hr style="margin: 10px 0;">
      <div>
        <strong>Stats:</strong>
        <div>Total unfollows: <span id="totalUnfollows">${totalUnfollows}</span></div>
        <div>Total Lucky Draw joined: <span id="totalLuckyDrawJoined">${totalLuckyDrawJoined}</span></div>
        <div>Version: v1.2</div>
        <div>t.me/lqcrypto</div>
      </div>
    </div>
`;

  const menuDiv = document.createElement('div');
  menuDiv.innerHTML = menuHTML;
  document.body.appendChild(menuDiv);

  // Add CSS for the toggle switch
  const switchCSS = `
    .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      -webkit-transition: .4s;
      transition: .4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      -webkit-transition: .4s;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #4caf50;
    }

    input:focus + .slider {
      box-shadow: 0 0 1px #4caf50;
    }

    input:checked + .slider:before {
      -webkit-transform: translateX(26px);
      -ms-transform: translateX(26px);
      transform: translateX(26px);
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.appendChild(document.createTextNode(switchCSS));
  document.head.appendChild(styleElement);

  // Add event listeners for buttons and toggle switch
  document.getElementById('autoUnfollowerToggle').addEventListener('change', toggleAutoUnfollower);
  document.getElementById('startButton').addEventListener('click', start);
  document.getElementById('stopButton').addEventListener('click', stop);
  document.getElementById('autoJoinToggle').addEventListener('change', toggleAutoJoin);
  document.getElementById('delayInput').addEventListener('change', setDelay);

  // Update totalUnfollows and totalLuckyDrawJoined in the UI
  document.getElementById('totalUnfollows').textContent = totalUnfollows;
  document.getElementById('totalLuckyDrawJoined').textContent = totalLuckyDrawJoined;

  document.getElementById('autoJoinToggle').checked = enableAutoJoin;
  document.getElementById('delayInput').value = delayBetweenActions;
})();
