from faster_whisper import WhisperModel
import requests
import subprocess
import sounddevice as sd
import scipy.io.wavfile as wav
import numpy as np

whisper = WhisperModel("base", device="cpu", compute_type="int8")

messages = [
      {"role": "system", "content": "You are a voice assistant. When the user asks to play music, you MUST call the music tool — never simulate or pretend. When the user asks about weather or sports, use those tools. Never make up answers for things your tools can handle."}
  ]

def listen() -> str:
    print("Listening... press Enter to stop")
    recording = []

    stream = sd.InputStream(
        samplerate=16000,
        channels=1,
        callback=lambda indata, frames, time, status: recording.append(indata.copy()),
    )

    with stream:
        input()

    if not recording:
        return ""
    audio = np.concatenate(recording)
    wav.write("input.wav", 16000, audio)
    return "input.wav"


def call_tool(tool: str, params: dict = {}) -> str:
    base = "http://localhost:3000/api"
    routes = {
        "weather": f"{base}/weather",
        "sports": f"{base}/sports",
        "joke": f"{base}/joke",
        "news": f"{base}/news",
        "meater": f"{base}/meater",
        "music": f"{base}/music",
        "timer": f"{base}/timer",
    }

    url = routes.get(tool)
    if not url:
        return f"Unknown tool: {tool}"
    response = requests.get(url, params=params)
    return response.json().get("result", "No result")


def transcribe(audio_path: str) -> str:
    segments, _ = whisper.transcribe(audio_path)
    return " ".join([s.text for s in segments]).strip()


def ask(text: str) -> str:
    tools = [
        {
            "type": "function",
            "function": {
                "name": "weather",
                "description": "Call this when the user asks about weather, temperature, forecast, or whether to bring a jacket. Do NOT answer weather questions from memory.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string", "description": "The city name"}
                    },
                    "required": ["city"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "sports",
                "description": "Call this when the user asks about sports scores, game results, or if a team won. Do NOT answer sports questions from memory.",
                "parameters": {
                    "type": "object",
                    "properties": {"team": {"type": "string"}},
                    "required": ["team"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "joke",
                "description": "Call this when the user asks for a joke or wants to hear something funny.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "news",
                "description": "Call this when the user asks about the news, headlines, or what's happening in the world.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "meater",
                "description": "Call this when the user asks about their BBQ, grill temperature, or Meater probe.",
                "parameters": {
                    "type": "object",
                    "properties": {},
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "music",
                "description": "ALWAYS call this tool when the user asks to play any song, music, or artist. NEVER pretend to play music. NEVER respond with markdown or fake song output. Call this tool immediately.",
                "parameters": {
                    "type": "object",
                    "properties": {"query": {"type": "string"}},
                    "required": ["query"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "timer",
                "description": "Call this when the user asks to set a timer.",
                "parameters": {
                    "type": "object",
                    "properties": {"minutes": {"type": "number"}},
                    "required": ["minutes"],
                },
            },
        },
    ]
    messages.append({"role": "user", "content": text})

    response = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": "qwen2.5:3b",
            "messages": messages,
            "tools": tools,
            "stream": False,
        },
    )
    message = response.json()["message"]
    if message.get("tool_calls"):
        tool_call = message["tool_calls"][0]
        tool_name = tool_call["function"]["name"]
        tool_args = tool_call["function"]["arguments"]
        tool_result = call_tool(tool_name, tool_args)
        followup = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "qwen2.5:3b",
                "messages": [
                    {"role": "user", "content": text},
                    {
                        "role": "assistant",
                        "content": "",
                        "tool_calls": message["tool_calls"],
                    },
                    {"role": "tool", "content": tool_result},
                ],
                "stream": False,
            },
        )
        result = followup.json()["message"]["content"]
        messages.append({"role": "assistant", "content": result})
        return result
    messages.append({"role": "assistant", "content": message["content"]})
    return message["content"]


def speak(text: str) -> None:
    subprocess.run(
        [
            "piper",
            "--model",
            "models/en_US-lessac-medium.onnx",
            "--output_file",
            "out.wav",
        ],
        input=text.encode(),
        check=True,
    )
    subprocess.run(["afplay", "out.wav"])


if __name__ == "__main__":
    while True:
        audio_path = listen()
        text = transcribe(audio_path)
        if not text.strip():
            continue
        print(f"You said: {text}")
        if "play" in text.lower():
            query = text.lower().split("play", 1)[1].strip()
            print(f"Playing: {query}")
            subprocess.Popen(
                f'yt-dlp -f bestaudio -o - "ytsearch1:{query}" | ffplay -nodisp -autoexit -',
                shell=True,
            )
        elif "stop" in text.lower() or "pause" in text.lower():
            subprocess.run(["pkill", "-f", "ffplay"])
            print("Music stopped.")
        elif "skip" in text.lower():
            subprocess.run(["pkill", "-f", "ffplay"])
            query = (
                text.lower().split("skip", 1)[1].strip()
                if "skip" in text.lower() and len(text.lower().split("skip", 1)) > 1
                else ""
            )
            if query:
                subprocess.Popen(
                    f'yt-dlp -f bestaudio -o - "ytsearch1:{query}" | ffplay -nodisp -autoexit -',
                    shell=True,
                )
                print(f"Skipping to: {query}")
            else:
                print("Music skipped.")
        else:
            response = ask(text)
            print(f"Response: {response}")
            speak(response)
            requests.post(
                "http://localhost:3000/api/history",
                json={
                    "you": text,
                    "speaker": response,
                    "timestamp": __import__("datetime").datetime.now().isoformat(),
                },
            )
