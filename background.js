chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log('Message received in background script:', message);

    if (message.action === 'generateEmailResponse') {
        const emailData = message.emailData;

        if (!emailData) {
            console.error('No email data provided');
            sendResponse({ error: 'No email data provided' });
            return;
        }

        const { body: content, subject, sender: emailSender, recipients, timestamp } = emailData;

        console.log('Email Data to be sent to backend:');
        console.log('Content:', content);
        console.log('Subject:', subject);
        console.log('Sender:', emailSender);
        console.log('Recipients:', recipients);
        console.log('Timestamp:', timestamp);

        if (!content || !subject || !emailSender || !recipients || !timestamp) {
            console.error('Missing email data fields:', emailData);
            sendResponse({ error: 'Missing email data fields' });
            return;
        }

        // Call your Flask backend API to generate the email response
        fetch('http://localhost:5000/api/generate_email_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email_content: content,
                email_subject: subject,
                email_sender: emailSender,
                email_recipients: recipients,
                email_timestamp: timestamp
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Received response from Flask backend:', data);
                if (data.response) {
                    // Send the response back to the popup
                    chrome.runtime.sendMessage({ action: 'displayEmailResponse', response: data.response });
                    sendResponse({ success: true });
                } else if (data.error) {
                    throw new Error('Error from backend: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error calling backend API:', error);
                // Send an error message back to the popup
                chrome.runtime.sendMessage({ action: 'displayEmailResponse', response: 'Error generating response: ' + error.message });
                sendResponse({ error: 'Error generating response: ' + error.message });
            });

        // Ensure sendResponse is called asynchronously
        return true;
    }
});
