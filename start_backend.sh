#!/bin/bash
cd /Users/mikegehrke/dev/vibeai/backend
PYTHONPATH=/Users/mikegehrke/dev/vibeai/backend /Users/mikegehrke/dev/.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
