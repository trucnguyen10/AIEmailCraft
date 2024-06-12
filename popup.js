document.addEventListener('DOMContentLoaded', function () {
    const generateButton = document.getElementById('generateButton');
    const responseArea = document.getElementById('responseArea');

    generateButton.addEventListener('click', function () {
        // Send a message to the background script to trigger email response generation
        console.log('Generate button clicked');
        chrome.runtime.sendMessage({ action: 'generateEmailResponse' });
    });

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message.action === 'displayEmailResponse') {
            console.log('Received response from background script:', message.response);
            responseArea.textContent = message.response;
        }
    });
});
