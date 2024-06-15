import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openai import AzureOpenAI
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Azure OpenAI client
chatClient = AzureOpenAI(
    azure_endpoint=os.getenv("AOAI_ENDPOINT"),
    api_key=os.getenv("AOAI_KEY"),
    api_version="2023-05-15"
)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/generate_email_response', methods=['POST'])
def generate_email_response():
    data = request.json
    email_content = data.get("email_content", "")
    email_subject = data.get("email_subject", "")
    email_sender = data.get("email_sender", "")
    email_recipients = data.get("email_recipients", "")
    email_timestamp = data.get("email_timestamp", "")

    logging.debug(f"Received email data: {data}")

    custom_prompt = f"Generate a professional email response to the following email content:\n\n{
        email_content}"

    try:
        # Create chat completion request
        chatResponse = chatClient.chat.completions.create(
            model="gpt-35-turbo",  # Use an available model
            messages=[
                {"role": "user", "content": custom_prompt}
            ]
        )

        conversation = [
            {"role": "user", "content": custom_prompt},
            {"role": "assistant",
                "content": chatResponse.choices[0].message.content}
        ]

        return jsonify({"conversation": conversation})

    except Exception as e:
        logging.error(f"Error generating response: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
