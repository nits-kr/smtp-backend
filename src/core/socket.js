const logger = require("./logger");
const { redisConnection } = require("../config/redis");
let io = null;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "*", // Allow all for dev; restrict in production
      //   origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // Setup Redis Subscriber
  const sub = redisConnection.duplicate();
  sub.subscribe("worker-events", (err, count) => {
    if (err) {
      logger.error("Failed to subscribe: %s", err.message);
    } else {
      logger.info(`Subscribed to ${count} channel(s). Listening for worker events...`);
    }
  });

  sub.on("message", (channel, message) => {
    if (channel === "worker-events") {
      try {
        const parsed = JSON.parse(message);
        const { event, data } = parsed;
        if (event && data) {
          io.emit(event, data);
          // logger.info(`Broadcasting redis event: ${event}`);
        }
      } catch (e) {
        logger.error(`Error parsing redis message: ${e.message}`);
      }
    }
  });

  logger.info("Socket.io initialized");

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = {
  initSocket,
  getIo,
};
