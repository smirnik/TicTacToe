class GameConnection {

    #webSocket;

    constructor(onEvent) {
        this.#webSocket = new WebSocket(`wss://${window.location.host}/ws`);

        this.#webSocket.onopen = (e) => {
            onEvent("connected", e);
        };

        this.#webSocket.onmessage = function (e) {
            if (onEvent) {
                let { eventType, eventData } = JSON.parse(e.data);
                if (onEvent && eventData) {
                    const eventObject = JSON.parse(eventData);
                    onEvent(eventType, eventObject);
                }
            }
        };

        this.#webSocket.onerror = function (e) {
            console.error("connection error: " + e);
            if (onEvent) {
                onEvent("connectionError", e);
            }
        };

        this.#webSocket.onclose = function (e) {
            if (onEvent) {
                onEvent && onEvent("disconnected", e);
            }
        };
    }

    disconnect() {
        this.#webSocket.close();
    }

    sendMove(cell, mark) {
        this.#send("Move", { cell, mark });
    }

    sendChatMessage(message) {
        this.#send("ChatMessage", { message });
    }

    sendReady(playerName) {
        this.#send("PlayerReady", { playerName });
    }

    #send(eventType, eventObject) {
        if (this.#webSocket.readyState !== WebSocket.OPEN) {
            throw new Error("Connection status is not open");
        }

        const event = JSON.stringify({
            eventType,
            eventData: JSON.stringify(eventObject)
        });

        this.#webSocket.send(event);
    }
}

export default GameConnection;
