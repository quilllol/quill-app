/* global __static */
"use strict";

import {
  app,
  Tray,
  Menu,
  screen,
  protocol,
  BrowserWindow,
  session,
  shell,
} from "electron";
import { autoUpdater } from "electron-updater";
import storage from "electron-json-storage";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import path from "path";
import ipcMain from "./ipcMain";

autoUpdater.checkForUpdatesAndNotify();

let win;
let secondWin;

// import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
const isDevelopment = process.env.NODE_ENV !== "production";

const singleInstanceLock = app.requestSingleInstanceLock();

if (!singleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      if (!win.isVisible()) win.show();
      win.focus();
    }
  });
}

let launchOptions = {
  openAtLogin: undefined,
  launchMinimized: undefined,
  minimizeOnClose: undefined,
};
const setupTrayIcon = () => {
  let tray;
  tray = new Tray(path.join(__static, "icon.png"));
  tray.setToolTip("Quill");
  tray.on("click", () => {
    win.show();
  });

  const handleLaunchOptions = {
    set: function (obj, prop, value) {
      if (prop === "openAtLogin") {
        app.setLoginItemSettings({ openAtLogin: value });
      } else {
        obj[prop] = value;
        // eslint-disable-next-line no-unused-vars
        const { openAtLogin, ...storageObj } = obj;
        storage.set("launchOptions", storageObj, (err) => {
          if (err) throw err;
        });
      }

      return true;
    },
  };

  const setContextMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
      { type: "normal", label: `Quill v${app.getVersion()}`, enabled: false },
      { type: "separator" },
      {
        type: "normal",
        label: "GitHub",
        click: () => {
          shell.openExternal("https://github.com/quilllol/quill-app");
        },
      },
      {
        type: "submenu",
        label: "Startup Options",
        submenu: [
          {
            type: "checkbox",
            label: "Launch Quill on Startup",
            checked: launchOptions.openAtLogin,
            click: (menuItem) => {
              launchOptions.openAtLogin = menuItem.checked;
            },
          },
          {
            type: "checkbox",
            label: "Launch Minimized",
            checked: launchOptions.launchMinimized,
            click: (menuItem) => {
              launchOptions.launchMinimized = menuItem.checked;
            },
          },
          { type: "separator" },
          {
            type: "checkbox",
            label: "Minimize on Close",
            checked: launchOptions.minimizeOnClose,
            click: (menuItem) => {
              launchOptions.minimizeOnClose = menuItem.checked;
            },
          },
        ],
      },
      { type: "separator" },
      {
        type: "normal",
        label: `Quit Quill`,
        click: app.quit,
      },
    ]);
    tray.setContextMenu(contextMenu);
    launchOptions = new Proxy(launchOptions, handleLaunchOptions);
  };

  storage.has("launchOptions", (err, hasKey) => {
    if (err) throw err;

    const setLaunchOptions = () => {
      storage.set(
        "launchOptions",
        {
          launchMinimized: false,
          minimizeOnClose: true,
        },
        (err) => {
          if (err) throw err;
        }
      );
      app.setLoginItemSettings({ openAtLogin: true });
      launchOptions.openAtLogin = true;
      launchOptions.launchMinimized = false;
      launchOptions.minimizeOnClose = true;
      setContextMenu();
    };

    if (hasKey) {
      storage.get("launchOptions", (err, data) => {
        if (err) throw err;

        if (
          !Object.prototype.hasOwnProperty.call(data, "launchMinimized") ||
          !Object.prototype.hasOwnProperty.call(data, "minimizeOnClose")
        ) {
          setLaunchOptions();
        } else {
          launchOptions.launchMinimized = data.launchMinimized;
          launchOptions.minimizeOnClose = data.minimizeOnClose;
          setContextMenu();
        }
      });
      const loginItemSettings = app.getLoginItemSettings();
      launchOptions.openAtLogin = loginItemSettings.openAtLogin;
    } else {
      setLaunchOptions();
    }
  });
};

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
  await setupTrayIcon();
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
  await ipcMain(launchOptions);
  win = await createWindow(
    {
      frame: false,
      resizable: false,
      width: 300,
      height: 405,
      show: false,
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

  if (launchOptions.launchMinimized) {
    win.hide();
  } else {
    win.show();
  }
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
