import path from "node:path";
import { app, BrowserWindow, ipcMain, Notification } from "electron";
import log from "electron-log";
import electronIsDev from "electron-is-dev";
import ElectronStore from "electron-store";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { startMCPServer } from "./mcp/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let appWindow: BrowserWindow | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const store = new ElectronStore();

const spawnAppWindow = async () => {
  const RESOURCES_PATH = electronIsDev
    ? path.join(__dirname, "../../assets")
    : path.join(process.resourcesPath, "assets");

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  appWindow = new BrowserWindow({
    width: 500,
    height: 300,
    icon: getAssetPath("icon.png"),
    show: false,
    webPreferences: {
      preload: path.resolve(__dirname, "..", "preload.js"),
    },
  });

  appWindow.loadURL("http://localhost:5674");

  appWindow.setMenu(null);
  appWindow.show();

  appWindow.on("closed", () => {
    appWindow = null;
  });

  new Notification({
    title: "Incoming Agent Questions",
    body: "Check and answer the questions",
  }).show();

  return appWindow;
};

await startMCPServer({
  onQuestions: async (questions) => {
    const appWindow = await spawnAppWindow();

    return new Promise((resolve) => {
      appWindow.on("close", () => {
        resolve(["Nah"]);
      });
    });
  },
});
