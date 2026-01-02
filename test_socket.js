const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('new_email', (data) => {
    console.log('Received new email event:', data);
});

socket.on('disconnect', () => {
    console.log('Disconnected');
});
