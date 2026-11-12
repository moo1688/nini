# LocalAgent

LocalAgent is a local-first React application with an Electron Windows desktop shell. The desktop bridge is isolated in a sandboxed preload; the renderer never receives Node.js access. Model calls are sent by the main process only to loopback addresses.

## Windows desktop development

Install root dependencies once, then install desktop dependencies:

```powershell
npm install
npm --prefix desktop install
npm --prefix desktop run dev
```

The desktop window serves the Vite UI at `127.0.0.1:3000` in development. To build a Windows x64 NSIS installer:

```powershell
npm --prefix desktop run dist:win
```

The installer is emitted under `desktop/dist/`. The build machine needs internet access to install dependencies and retrieve Electron build artifacts. The resulting app has no cloud model integration; it still requires a separately installed local model server (such as LM Studio) and downloaded model. A genuinely air-gapped build requires preparing all npm/Electron caches and model files in advance.

## Local model setup

Load a local GGUF model in LM Studio and enable its OpenAI-compatible server, normally `http://127.0.0.1:1234/v1`. Configure this address in Settings. Desktop requests go through Electron's main process and are validated as loopback HTTP. Browser development requests are similarly restricted by URL validation.

For a 16GB system, start with Qwen3-4B Q4 or Qwen2.5-Coder-3B Q4; model speed and memory use depend on the inference runtime. Models are not bundled in the installer.

## Available capabilities and explicit limitations

- Local chat, attachments for supported text formats, text cleanup, CSV/JSON/HTML/XML processing, chunked keyword retrieval, IndexedDB persistence, knowledge import/export, Markdown generation and theme preference.
- PDF/DOC/DOCX/XLS/XLSX files can be selected but this version does not contain binary parsers or OCR; it reports that no text was extracted.
- No native task scheduler/background service, arbitrary code execution, vector embeddings, encrypted knowledge vault, or bundled model is included. Do not store highly sensitive information in browser storage without an appropriate encryption/backup plan.
- Desktop local model server may need to allow the renderer origin/CORS if using the browser path; packaged desktop uses a controlled IPC bridge for model operations.

## Security boundaries

Electron enables context isolation, sandboxing, disabled Node integration and web security. The renderer is not allowed to navigate to remote sites. External model endpoints and remote content tools are intentionally unsupported. Verify the installer and model licenses before redistribution.
