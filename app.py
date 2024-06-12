import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from azure.openai import AzureOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Azure OpenAI client
chatClient = AzureOpenAI(
    azure_endpoint=os.getenv("AOAI_ENDPOINT"),
    api_key=os.getenv("AOAI_KEY"),
    api_version="2023-05-15"
)


@app.route('/api/generate_email_response', methods=['POST'])
def generate_email_response():
    data = request.json
    email_content = data.get("email_content", "")
    email_subject = data.get("email_subject", "")
    email_sender = data.get("email_sender", "")
    email_recipients = data.get("email_recipients", "")
    email_timestamp = data.get("email_timestamp", "")

    custom_prompt = (
        f"Subject: {email_subject}\n"
        f"From: {email_sender}\n"
        f"To: {email_recipients}\n"
        f"Date: {email_timestamp}\n\n"
        f"{email_content}\n\n"
        "AI Generated Response:"
    )

    try:
        # Create chat completion request
        chatResponse = chatClient.chat.completions.create(
            model="gpt-35-turbo",  # Use an available model
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": custom_prompt}
            ]
        )

        response_text = chatResponse.choices[0].message.content.strip()

        return jsonify({"response": response_text})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
