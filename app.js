const { App, LogLevel, SocketModeReceiver } = require("@slack/bolt");
const pino = require("pino");
const { setupServer } = require("msw/node");

const {
  getMockAppsConnectionsOpenHandler,
  mockAuthTest,
  mockSocket,
} = require("./mockServer");

const logger = pino({
  level: LogLevel.DEBUG,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
});

const server = setupServer(
  mockSocket,
  mockAuthTest,
  getMockAppsConnectionsOpenHandler(logger)
);

server.listen();

process.on("SIGINT", () => {
  server.close();
});

const socketModeReceiver = new SocketModeReceiver({
  appToken: process.env.APP_TOKEN,
  installerOptions: {
    port: 7101,
    // clientOptions: { retryConfig: { retries: 3 } },
  },
  logger: {
    getLevel: () => LogLevel.DEBUG,
    info: (message) => {
      logger.info(message);
    },
    debug: (message) => logger.debug(message),
    warn: (message) => logger.warn(message),
    error: (message) => logger.error(message),
  },
  logLevel: LogLevel.DEBUG,
});

const app = new App({
  receiver: socketModeReceiver,
  token: process.env.BOT_TOKEN,
});

(async () => {
  await app.start();
  console.log("⚡️ Bolt app started");
})();
