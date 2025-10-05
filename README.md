# Amimi GenStory Service

## Setup

- Copy `config.example.json` to `config.json` and add your Gemini API key and 
  optional model overrides. This file stays local (listed in `.gitignore`).
- Install dependencies via `python -m venv venv && source venv/bin/activate && 
  pip install -r requirements.txt`.
- Start the dev server with `./scripts/run_local.sh`, then open 
  `http://localhost:8000` for the prototype UI.

## Scripts

- `scripts/run_local.sh` runs uvicorn with reload.
- Backing data (stories/images) get stored under `data/`.

