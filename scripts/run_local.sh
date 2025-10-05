#!/bin/bash

# Launches the FastAPI development server with hot reload.

if [ -d "venv" ]; then
  source venv/bin/activate
fi

uvicorn server:app --reload --port 8000

