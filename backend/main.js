const Websocket = require("ws");

const wss = new Websocket.Server({ port: 8080 });

let playerCount = 0;
let playerPos = {};

wss.on("connection", (ws) => {
    console.log("New client connected!");

    console.log(playerPos);

    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());

        switch (data.type) {
            case "playerConnect":
                playerPos[playerCount] = { x: Math.floor(Math.random() * 49), y: Math.floor(Math.random() * 49), color: "red" };
                ws.send(JSON.stringify({ type: "playerId", playerId: playerCount++, players: playerPos }));
                break;
            case "playerUpdate":
                playerPos[data.playerId] = data.players;
                wss.clients.forEach((client) => {
                    if (client.readyState === Websocket.OPEN) {
                        client.send(JSON.stringify({ type: "playerUpdate", players: playerPos }));
                    }
                });
                break;
            case "playerDisconnect":
                delete playerPos[data.playerId];
                wss.clients.forEach((client) => {
                    if (client.readyState === Websocket.OPEN) {
                        client.send(JSON.stringify({ type: "playerUpdate", players: playerPos }));
                    }
                });
                break;
            default:
                break;
        }
    });
});