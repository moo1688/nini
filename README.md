# LocalAgent

LocalAgent is a local-first React/Vite desktop-style UI prototype. It stores conversations and document metadata in browser IndexedDB and can call an **OpenAI-compatible model server bound to localhost** (tested by design against LM Studio's `/v1` API).

## Run

Requires Node.js 20+ and a one-time dependency install:

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`. To make model responses work, install and load a local GGUF model in LM Studio, start its local server, then configure the localhost `/v1` URL in Settings. Qwen2.5-Coder 3B/7B Q4 or Qwen3 4B Q4 are reasonable candidates for a 16GB system; choose a size that leaves memory for Windows and the UI.

## Current capabilities and boundaries

- Chat requests are sent only to a validated loopback address (`localhost`, `127.0.0.1`, or `::1`); no cloud API or telemetry is used by app code.
- Attachments can be selected in chat. TXT, Markdown, CSV, JSON, and LOG are read locally and included in the prompt.
- Document uploads are recorded in IndexedDB. Text formats above are normalized and searchable. PDF/DOCX/XLSX and legacy Office files are recorded but **their content is not extracted in this frontend-only implementation**; do not treat them as parsed or summarized.
- Document prompt generation creates and downloads a Markdown draft through the configured local model.
- Knowledge retrieval is simple local keyword matching, not vector search. Data cleanup removes control characters, normalizes newlines/whitespace, and trims.
- Theme supports dark, light, and the operating-system color preference.
- The scheduler, native filesystem access, arbitrary code execution, OCR, full Office/PDF parsing, vector embeddings, installer packaging, and background execution are not implemented. Browser scheduling only works while a page is open, so this build does not claim to be a complete native/offline Windows Agent.

## Offline and safety notes

The app has no online runtime assets. Build dependencies must be installed before an offline machine can run it (prepare an npm cache or bundle a deployment build in advance). The local model server must support browser CORS for `http://127.0.0.1:3000`; use only a loopback-bound server. Uploaded data stays in the browser's local IndexedDB, which is not an encrypted vault and may be cleared by browser settings.
