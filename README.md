# LocalAgent

LocalAgent is a local-first React/Vite application. Conversations and extracted text are stored in browser IndexedDB. Model requests are restricted to a loopback host and use an OpenAI-compatible local API (for example, LM Studio).

## Run

Requires Node.js 20+ and a one-time dependency install:

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`. Load a local GGUF model in LM Studio and start its local server; configure the localhost `/v1` URL in Settings. Qwen3-4B Q4 or Qwen2.5-Coder-3B Q4 are reasonable starting points for a 16GB system, but model performance depends on the local runtime and memory available to Windows.

## Implemented

- Local OpenAI-compatible chat with strict loopback URL validation.
- Chat attachments and document import for TXT, Markdown, CSV, JSON, LOG, HTML, and XML. CSV is parsed into readable rows; JSON is formatted/validated; HTML scripts/styles are removed; text is normalized and control characters are cleaned.
- PDF/DOC/DOCX/XLS/XLSX can be selected and recorded, but no binary document parser is bundled. The UI explicitly reports that their contents were not extracted.
- Local document prompt generation uses matching knowledge excerpts and downloads a Markdown draft.
- IndexedDB-backed conversations and document text, keyword retrieval across overlapping text chunks, JSON knowledge import/export.
- Dark/light theme and following the operating-system color preference.

## Not yet implemented

This remains a browser app, not an installed Windows desktop Agent. There is no PDF/Office parser, OCR, vector database, native filesystem access, arbitrary code execution, background scheduler, model bundled in the installer, or desktop installer. The local scheduler only could run in a foreground page and is intentionally not claimed as implemented. CORS must be enabled by the local model server for the app origin. Browser IndexedDB is not an encrypted vault. Offline runtime requires building the app and pre-populating dependencies before disconnecting from the network.
