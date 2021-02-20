import { ipcMain, BrowserWindow, webContents } from "electron";

const getBrowserWindow = webContents => {
  return BrowserWindow.fromWebContents(webContents);
};

export default () => {
  ipcMain.handle("minimize", async e => {
    getBrowserWindow(e.sender).minimize();
  });

  ipcMain.handle("unmaximize", async e => {
    getBrowserWindow(e.sender).unmaximize();
  });

  ipcMain.handle("maximize", async e => {
    getBrowserWindow(e.sender).maximize();
  });

  ipcMain.handle("close", async e => {
    getBrowserWindow(e.sender).close();
  });

  ipcMain.handle("setChannel", async (e, channel) => {
    webContents.getAllWebContents().forEach(webContents => {
      webContents.send("setChannel", channel);
    });
  });
};
