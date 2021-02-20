const { contextBridge, ipcRenderer } = require("electron");

window.ipcRendererOn = ipcRenderer.on;

contextBridge.exposeInMainWorld("api", {
  minimize: () => ipcRenderer.invoke("minimize"),
  unmaximize: () => ipcRenderer.invoke("unmaximize"),
  maximize: () => ipcRenderer.invoke("maximize"),
  close: () => ipcRenderer.invoke("close"),
  setChannel: channel => ipcRenderer.invoke("setChannel", channel),
  onSetChannel: callback =>
    ipcRenderer.on("setChannel", (event, ...args) => callback(...args))
});
