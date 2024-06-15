console.log('Content script loaded');

// Function to extract email data
function getEmailData() {
    const emailData = {
        subject: null,
        sender: null,
        body: null,
        timestamp: null
    };

    // Extract the email subject
    const subjectContainer = document.querySelector('h2.hP');
    emailData.subject = subjectContainer ? subjectContainer.innerText : 'Subject not found';

    // Extract the sender's email address
    const senderContainer = document.querySelector('span.gD');
    const senderName = senderContainer ? senderContainer.innerText : 'Sender name not found';
    const senderEmail = senderContainer ? senderContainer.getAttribute('email') : 'Sender email not found';
    emailData.sender = senderName && senderEmail ? `${senderName} <${senderEmail}>` : 'Sender not found';

    // Attempt to extract the email body content using multiple selectors
    let bodyContainer = document.querySelector('.a3s.aXjCH');
    if (!bodyContainer) {
        bodyContainer = document.querySelector('div[role="listitem"] .ii.gt');
    }
    if (!bodyContainer) {
        bodyContainer = document.querySelector('.a3s');
    }
    emailData.body = bodyContainer ? bodyContainer.innerText : 'Body not found';

    // Log body extraction details
    console.log('Body Container:', bodyContainer);
    console.log('Body Content:', emailData.body);

    // Extract the email timestamp
    const timestampContainer = document.querySelector('.g3');
    emailData.timestamp = timestampContainer ? timestampContainer.getAttribute('title') : 'Timestamp not found';

    console.log('Extracted email data:', emailData);

    return emailData;
}

// Function to handle changes in the Gmail page
function handleMutation(mutations) {
    try {
        console.log('Mutation observed:', mutations);
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                const emailData = getEmailData();
                console.log('Checking email data:', emailData);
                if (emailData.body !== 'Body not found') {
                    console.log('Sending email data to background script');
                    tryToSendMessage(emailData);
                } else {
                    console.error('Incomplete email data:', emailData);
                }
            }
        });
    } catch (error) {
        console.error('Error in handleMutation:', error);
    }
}

// Function to try sending the message, with retries if necessary
function tryToSendMessage(emailData, retries = 3) {
    try {
        if (chrome.runtime && chrome.runtime.sendMessage) {
            console.log('Attempting to send message with email data:', emailData);
            chrome.runtime.sendMessage({ action: 'generateEmailResponse', emailData: emailData }, response => {
                if (chrome.runtime.lastError) {
                    console.error('Error sending message to background script:', chrome.runtime.lastError.message);
                } else {
                    console.log('Response from background script:', response);
                }
            });
        } else {
            throw new Error('chrome.runtime or chrome.runtime.sendMessage is not available');
        }
    } catch (e) {
        if (retries > 0) {
            console.error(`Retrying sendMessage due to error: ${e.message}. Retries left: ${retries - 1}`);
            setTimeout(() => tryToSendMessage(emailData, retries - 1), 1000);
        } else {
            console.error('Failed to send message after multiple attempts:', e);
        }
    }
}

// Create a MutationObserver to watch for changes in the Gmail page
const observer = new MutationObserver(handleMutation);

// Start observing the Gmail content area for changes
const targetNode = document.querySelector('body');
const config = { childList: true, subtree: true };
observer.observe(targetNode, config);

console.log('MutationObserver set up and running.');
