const socket = new WebSocket("ws://localhost:8080");
let playerPos = {};
let playerId = '';

function renderPlayer() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let key in playerPos) {
        if (playerPos[key] !== null) {
            ctx.fillStyle = playerPos[key].color;
            ctx.fillRect(playerPos[key].x*10, playerPos[key].y*10, 20, 20);
        }
    } 
}

function playerUpdate(event) {
    if (playerPos.length === 0) return;
    switch (event.key) {
        case 'a' || 'A':
            playerPos[playerId].x -= 1;
            break;
        case 'd' || 'D':
            playerPos[playerId].x += 1;
            break;
        case 'w' || 'W':
            playerPos[playerId].y -= 1;
            break;
        case 's' || 'S':
            playerPos[playerId].y += 1;
            break;
        default:
            break;
    }
    playerPos[playerId].x = Math.min(Math.max(playerPos[playerId].x, 0), 48);
    playerPos[playerId].y = Math.min(Math.max(playerPos[playerId].y, 0), 48);
    renderPlayer();
    socket.send(JSON.stringify({ type: "playerUpdate", playerId: playerId, players: playerPos[playerId] }));
}

function setup() {
    socket.onopen = () => {
        socket.send(JSON.stringify({ type: "playerConnect" }));
    }  

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
            case "playerId": 
                playerId = data.playerId;
                playerPos = data.players;
                renderPlayer();
                break;
            case "playerUpdate":
                playerPos = data.players;
                renderPlayer();
                break;
            default:
                break;
        }
    }

    socket.onclose = () => {
        socket.send(JSON.stringify({ type: "playerDisconnect", playerId: playerId }));
    }

    window.onbeforeunload = () => {
        socket.send(JSON.stringify({ type: "playerDisconnect", playerId: playerId }));
    }
}

function newGame() {
    location.reload();
}

addEventListener("load", setup);
addEventListener("load", renderPlayer);
addEventListener("keypress", playerUpdate);
