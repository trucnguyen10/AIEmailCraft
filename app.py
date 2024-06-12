from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openai import AzureOpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

# Initialize OpenAI client
openai = AzureOpenAI(
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

    try:
        # Generate email response using OpenAI
        response = openai.Completion.create(
            engine="text-davinci-003",  # Use an available engine
            prompt=f"Generate a response for the following email content:\n\n{
                email_content}",
            temperature=0.7,
            max_tokens=150
        )

        generated_response = response.choices[0].text.strip()
        return jsonify({"response": generated_response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
