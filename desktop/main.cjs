const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

const DEFAULT_MODEL_URL = 'http://127.0.0.1:1234/v1';
const LOOPBACK = new Set(['localhost', '127.0.0.1', '::1']);

function localUrl(baseUrl, route) {
  const url = new URL(baseUrl);
  if (url.protocol !== 'http:' || !LOOPBACK.has(url.hostname.toLowerCase())) {
    throw new Error('模型服务只能使用本机 HTTP 地址（localhost/127.0.0.1/::1）。');
  }
  url.pathname = `${url.pathname.replace(/\/$/, '')}${route}`;
  url.search = '';
  url.hash = '';
  return url;
}

async function requestLocalModel({ baseUrl = DEFAULT_MODEL_URL, model = '' }, messages, signal) {
  const modelsResponse = await fetch(localUrl(baseUrl, '/models'), { signal });
  if (!modelsResponse.ok) throw new Error(`本地模型服务返回 HTTP ${modelsResponse.status}`);
  const listing = await modelsResponse.json();
  const chosen = model || listing.data?.[0]?.id;
  if (!chosen) throw new Error('本地模型服务没有已加载的模型。');
  const response = await fetch(localUrl(baseUrl, '/chat/completions'), {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: chosen, messages, temperature: 0.4, stream: false }), signal,
  });
  if (!response.ok) throw new Error(`模型推理失败：HTTP ${response.status} ${await response.text()}`);
  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('模型返回空内容。');
  return content;
}

function registerIpc() {
  ipcMain.handle('localagent:model-list', async (_event, config) => {
    const response = await fetch(localUrl(config?.baseUrl || DEFAULT_MODEL_URL, '/models'), { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`本地模型服务返回 HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data.data) ? data.data.map(item => item.id).filter(Boolean) : [];
  });
  ipcMain.handle('localagent:chat', async (_event, config, messages) => {
    if (!Array.isArray(messages) || messages.length > 40 || messages.some(message => typeof message?.content !== 'string' || message.content.length > 100_000)) {
      throw new Error('请求内容无效或超出本地服务限制。');
    }
    return requestLocalModel(config || {}, messages, AbortSignal.timeout(180_000));
  });
  ipcMain.handle('localagent:save-text', async (_event, { suggestedName, content }) => {
    if (typeof content !== 'string' || content.length > 5_000_000) throw new Error('导出内容过大或无效。');
    const result = await dialog.showSaveDialog({ defaultPath: path.basename(String(suggestedName || 'document.md')), filters: [{ name: 'Markdown', extensions: ['md'] }, { name: 'Text', extensions: ['txt'] }] });
    if (result.canceled || !result.filePath) return false;
    await fs.writeFile(result.filePath, content, { encoding: 'utf8', flag: 'wx' }).catch(async error => {
      if (error.code !== 'EEXIST') throw error;
      const confirm = await dialog.showMessageBox({ type: 'warning', buttons: ['覆盖', '取消'], defaultId: 1, message: '文件已存在，是否覆盖？' });
      if (confirm.response !== 0) return;
      await fs.writeFile(result.filePath, content, 'utf8');
    });
    return true;
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 850, minWidth: 850, minHeight: 600,
    title: 'LocalAgent', backgroundColor: '#0f1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      webSecurity: true,
    },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Never open remote pages from the local application.
    if (url.startsWith('mailto:')) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    const allowed = app.isPackaged ? url.startsWith('file://') && url.includes('/dist/index.html') : url.startsWith('http://127.0.0.1:3000/');
    if (!allowed) event.preventDefault();
  });
  if (app.isPackaged) win.loadFile(path.join(process.resourcesPath, 'dist', 'index.html'));
  else win.loadURL('http://127.0.0.1:3000');
  if (!app.isPackaged) win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => { registerIpc(); createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
