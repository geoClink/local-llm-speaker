from faster_whisper import WhisperModel
import requests
import subprocess

whisper = WhisperModel("base", device="cpu", compute_type="int8")


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
                "description": "Call this when the user asks to play music, a song, or an artist.",
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
    response = requests.post(
        "http://localhost:11434/api/chat",
        json={
            "model": "qwen2.5:3b",
            "messages": [{"role": "user", "content": text}],
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
        return followup.json()["message"]["content"]
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
    text = transcribe("test.wav")
    print(f"You said: {text}")
    response = ask(text)
    print(f"Response: {response}")
    speak(response)
