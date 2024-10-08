from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
from pydub import AudioSegment
from io import BytesIO
from openai import OpenAI
import json

app = Flask(__name__)
CORS(app)
recognizer = sr.Recognizer()

api_key = 'sk-proj-CGHzSQzNC5bBJtHFkhjST3BlbkFJmQ1vzYcUU861qgcgC0De'
client = OpenAI(api_key=api_key)

@app.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        audio_file = request.files['file']
        audio_data = audio_file.read()

        audio = AudioSegment.from_file(BytesIO(audio_data))
        wav_audio = BytesIO()
        audio.export(wav_audio, format='wav')

        audio_clip = sr.AudioFile(wav_audio)
        with audio_clip as source:
            audio_content = recognizer.record(source)
        transcription = recognizer.recognize_google(audio_content)
        formatted = {
            "title": "Extracted title from response",
            "subtitle": "Extracted subtitle from response",
            "startTime": "Extracted start time from response",
            "date": "Extracted date from response"
        }

        response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"You are a helpful assistant. Your job is to help users organize their tasks by extracting important details such as the task title, description, start time, and date formatted as DD/MM/YYYY. I need the output in JSON format like {formatted}."},
            {"role": "user", "content": "I need to prepare for the upcoming budget review meeting."},
            {"role": "assistant", "content": '{"title": "Budget Review Preparation", "subtitle": "Prepare necessary documents and updates for the budget review", "startTime": "2:00 PM", "date": "22/09/2023"'},
            {"role": "user", "content": transcription} 
        ]
        )
        print(response.choices[0].message.content)
        task_details = response.choices[0].message.content
        task_details_json = json.loads(task_details) 
        print("Task details as JSON:", task_details_json)
        print("Type of task details JSON:", type(task_details_json))  
        return jsonify({"transcription": transcription, "task_details": task_details_json})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
