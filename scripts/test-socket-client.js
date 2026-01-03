const { io } = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log(`Connected to server with ID: ${socket.id}`);

    // Keep the connection open for a moment then disconnect
    setTimeout(() => {
        socket.disconnect();
    }, 2000);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
    process.exit(0);
});

socket.on("connect_error", (err) => {
    console.log(`Connection error: ${err.message}`);
    process.exit(1);
});
