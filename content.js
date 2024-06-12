console.log('Content script loaded');

// Function to extract email data
function getEmailData() {
    const emailData = {
        subject: null,
        sender: null,
        body: null,
        recipients: null,
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

    // Extract the email body content
    const bodyContainer = document.querySelector('.a3s.aXjCH');
    emailData.body = bodyContainer ? bodyContainer.innerText : 'Body not found';

    // Extract the email recipients
    const recipientsContainer = document.querySelectorAll('.vR');
    if (recipientsContainer) {
        emailData.recipients = Array.from(recipientsContainer).map(recipient => recipient.innerText).join(', ');
    }

    // Extract the email timestamp
    const timestampContainer = document.querySelector('.g3');
    emailData.timestamp = timestampContainer ? timestampContainer.getAttribute('title') : 'Timestamp not found';

    console.log('Extracted email data:', emailData);

    return emailData;
}

// Function to handle changes in the Gmail page
function handleMutation(mutations) {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
            const emailData = getEmailData();
            if (emailData.subject !== 'Subject not found' && emailData.sender !== 'Sender not found' && emailData.body !== 'Body not found') {
                console.log('Sending email data to background script');
                chrome.runtime.sendMessage({ action: 'generateEmailResponse', emailData: emailData }, response => {
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message to background script:', chrome.runtime.lastError.message);
                    } else {
                        console.log('Response from background script:', response);
                    }
                });
            }
        }
    });
}

// Create a MutationObserver to watch for changes in the Gmail page
const observer = new MutationObserver(handleMutation);

// Start observing the Gmail content area for changes
const targetNode = document.querySelector('body');
const config = { childList: true, subtree: true };
observer.observe(targetNode, config);

console.log('MutationObserver set up and running.');
