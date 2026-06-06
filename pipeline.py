from faster_whisper import WhisperModel
import requests
import subprocess

whisper = WhisperModel("base", device="cpu", compute_type="int8")

def transcribe (audio_path: str) -> str:
    segments, _ = whisper.transcribe(audio_path)
    return " ".join([s.text for s in segments]).strip()

def ask (text : str) -> str:
    response =requests.post("http://localhost:11434/api/chat", json= {
        "model": "qwen2.5:3b",
        "messages":[{"role": "user", "content": text}],
        "stream": False
    })
    return response.json()["message"]["content"]

def speak (text: str) -> None:
    subprocess.run(["piper", "--model", "models/en_US-lessac-medium.onnx", "--output_file", "out.wav"], input=text.encode(), check=True)
    subprocess.run(["afplay", "out.wav"])

if __name__ == "__main__":
    text = transcribe("test.wav")
    print(f"You said: {text}")
    response = ask(text)
    print(f"Response: {response}")
    speak(response)