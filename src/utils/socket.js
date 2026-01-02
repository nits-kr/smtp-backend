let io = null;

const initSocket = (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
        cors: {
            origin: '*', // Allow all for dev; restrict in production
            methods: ['GET', 'POST']
        }
    });
    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = {
    initSocket,
    getIo
};
