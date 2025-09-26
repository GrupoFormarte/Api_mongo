"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebSocketConnection = void 0;
const sse_service_1 = require("./sse.service");
const handleWebSocketConnection = (ws) => {
    (0, sse_service_1.addClient)(ws);
    ws.send(JSON.stringify({ message: 'WebSocket conectado' }));
    ws.on('message', (message) => {
        console.log('Mensaje del cliente:', message.toString());
        // Puedes reaccionar a mensajes entrantes si quieres
    });
    ws.on('close', () => {
        (0, sse_service_1.removeClient)(ws);
        console.log('Cliente WebSocket desconectado');
    });
};
exports.handleWebSocketConnection = handleWebSocketConnection;
