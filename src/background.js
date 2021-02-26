"use strict";

import { app, screen, protocol, BrowserWindow, session } from "electron";
import { autoUpdater } from "electron-updater";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import path from "path";
import ipcMain from "./ipcMain";

autoUpdater.checkForUpdatesAndNotify();

let win;
let secondWin;

// import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";

app.on("web-contents-created", (event, contents) => {
  contents.on("will-attach-webview", (event, webPreferences) => {
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;
    delete webPreferences.preloadURL;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;

    // Verify URL being loaded
    // if (!params.src.startsWith("https://example.com/")) {
    event.preventDefault();
    // }
  });
});

// const URL = require("url").URL;

app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event) => {
    // const parsedUrl = new URL(navigationUrl);

    // if (parsedUrl.origin !== "https://example.com") {
    event.preventDefault();
    // }
  });
});

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

async function createWindow(
  browserWindowOptions,
  mouseEvents,
  devPath,
  prodPath
) {
  // Create the browser window.
  const win = new BrowserWindow(browserWindowOptions);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#/${devPath}`);
    // if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    await win.loadURL(`app://./${prodPath}`);
  }
  win.setIgnoreMouseEvents(!mouseEvents);
  return win;
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    win = createWindow("", "index.html");
  }
  if (secondWin === null) {
    secondWin = createWindow("subpage", "subpage.html");
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await installExtension(VUEJS_DEVTOOLS);
    // } catch (e) {
    //   console.error("Vue Devtools failed to install:", e.toString());
    // }
  } else {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' https://channels.quill.lol https://fonts.gstatic.com https://fonts.googleapis.com/;",
          ],
        },
      });
    });
  }
  let display = screen.getPrimaryDisplay();
  let width = display.workArea.width;
  let height = display.workArea.height;
  await ipcMain();
  win = await createWindow(
    {
      frame: false,
      width: 300,
      height: 405,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      },
    },
    true,
    "",
    "index.html"
  );
  win.on("close", () => {
    app.quit();
  });
  secondWin = await createWindow(
    {
      transparent: true,
      frame: false,
      width: 300,
      height: 300,
      x: width - 300 - 20,
      y: height - 300 - 20,
      focusable: false,
      alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        contextIsolation: true,
        // Use pluginOptions.nodeIntegration, leave this alone
        // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      },
    },
    false,
    "notification",
    "index.html/#/notification"
  );
  app.on("web-contents-created", (event, contents) => {
    contents.setWindowOpenHandler(() => {
      // In this example, we'll ask the operating system
      // to open this event's url in the default browser.
      //
      // See the following item for considerations regarding what
      // URLs should be allowed through to shell.openExternal.
      // if (isSafeForExternalOpen(url)) {
      //   setImmediate(() => {
      //     shell.openExternal(url);
      //   });
      // }

      return { action: "deny" };
    });
  });
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
