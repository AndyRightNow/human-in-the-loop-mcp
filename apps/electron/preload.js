const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("ElectronAPI", {
  getQuestions: () => ipcRenderer.send("get-questions"),
});
