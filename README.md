# local-llm-speaker
Private, offline smart speaker built from scratch. Raspberry Pi 5 brain running Whisper STT, Ollama + Qwen3, and Piper TTS. Web dashboard for full control. No cloud. No subscription. No voice data leaving your network.

## Stack
- **Speech-to-text:** faster-whisper (runs locally on CPU)
- **LLM:** Ollama + Qwen3 4B
- **Text-to-speech:** Piper TTS
- **Backend:** Node.js + Express + WebSockets
- **Frontend:** Vanilla JS dashboard served at `http://speaker.local:3000`
- **Hardware:** Raspberry Pi 5 8GB + NVMe SSD + ESP32-S3 PCB

## Tools
- Weather — Open-Meteo (free, no API key)
- Sports scores — ESPN unofficial API (free, no API key)
- BBQ probe — Meater Cloud API
- Music — yt-dlp streaming from YouTube
- Timer and alarms
- News headlines — RSS feed
- Reminders
- Google Calendar
- Shopping list
- Jokes and trivia

## Dashboard
Control everything from any device on your home WiFi:
- Voice selector and preview
- Wake word and sensitivity
- LLM model selector
- Tool toggles
- Conversation history
- Live system status (CPU, RAM, uptime)
- Music controls (now playing, play/pause/skip)
- Shopping list, timers, reminders

## Privacy
Your voice never leaves the Pi. Only outbound calls are weather/sports data fetches and Meater cook temps — no personal data sent.

 ## Running locally
Tab 1: node server.js
Tab 2: source venv/bin/activate && python3 pipeline.py