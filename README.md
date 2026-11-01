# read-aloud-coach

A read-aloud trainer that judges your speech and won't let you move on until you pass.

- Paste English text. It is split into sentences and shown one at a time.
- Read each sentence aloud. Speech recognition (Web Speech API, runs in your browser) checks every word.
- Missed words turn red. After a fail: listen to a model reading, say each missed word alone, then read the sentence again.
- Pass the sentence the required number of times (default 2 at 85% accuracy) to continue. There is no skip button.

Your text, history and weak-word list stay in your browser (localStorage). Nothing is sent to a server other than the browser's own speech recognition service.

Microphone access needs HTTPS (or `localhost`). Use Chrome or Safari.

## Run locally

    uv run --no-project python -m http.server 8765 --bind 127.0.0.1

Then open http://localhost:8765/

## Test

    node test.js
