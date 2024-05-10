# flask_server.py
from flask import Flask, request, jsonify
import speech_recognition as sr
from pydub import AudioSegment
from io import BytesIO

app = Flask(__name__)
recognizer = sr.Recognizer()

@app.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        # Retrieve audio file from the request
        audio_file = request.files['file']
        audio_data = audio_file.read()

        # Convert audio to wav format using pydub
        audio = AudioSegment.from_file(BytesIO(audio_data))
        wav_audio = BytesIO()
        audio.export(wav_audio, format='wav')

        # Transcribe using SpeechRecognition
        audio_clip = sr.AudioFile(wav_audio)
        with audio_clip as source:
            audio_content = recognizer.record(source)
        transcription = recognizer.recognize_google(audio_content)

        return jsonify({"transcription": transcription})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
