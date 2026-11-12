const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('localAgentDesktop', Object.freeze({
  isDesktop: true,
  listModels: config => ipcRenderer.invoke('localagent:model-list', config),
  chat: (config, messages) => ipcRenderer.invoke('localagent:chat', config, messages),
  saveText: (suggestedName, content) => ipcRenderer.invoke('localagent:save-text', { suggestedName, content }),
}));
