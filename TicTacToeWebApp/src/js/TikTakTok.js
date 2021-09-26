import GameConnection from './Connection.js';
import GameRenderer from './Renderer.js';
import GameMessageBoard from './MessageBoard.js';

/**
 * Enum for marks
 * @readonly
 * @enum {number}
 */
export const MarkEnum = Object.freeze({
    nothing: 0,
    x: 1,
    o: 2
});

const StatusMessages = new Map([
    ['waitingForSecondPlayer', 'Waiting for the second player'],
    ['started', 'Game started'],
    ['aborted', 'Game aborted'],
    ['finnished', 'Game finnished']
]);

/** Tik-Tak-Tok game */
export class TikTakTok {
    #board;
    #connected;
    #currentMarkMove;
    #eventMap;
    #gameConnection;
    #gameMessageBoard
    #gameRenderer;
    #mark;
    #onInvalidData;

    /**
     * @param {HTMLElement} canvas - canvas element where game will be rendered
     * @param {HTMLElement} messageBoard - container for game messages / chat
     */
    constructor(canvas, messageBoard) {
        this.#mapEvents();
        this.#board = Array(9).fill(0);
        this.#gameRenderer = new GameRenderer(canvas, this.#board, this.#onMove.bind(this), this.#canMove.bind(this));
        this.#gameMessageBoard = new GameMessageBoard(messageBoard);
    }

    /**
     * Connect to game server
     * @param {Function} connected - called when connected 
     */
    connect(connected) {
        this.#connected = connected;
        this.#gameConnection = new GameConnection(this.#onEventReceived.bind(this));
    }

    /**
     * Send chat message
     * @param {string} message
     */
    sendChatMessage(message) {
        this.#gameConnection.sendChatMessage(message);
    }

    /**
     * Called when player is ready to play
     * @param {string} name - Name of the player
     */
    ready(name, onInvalidData) {
        this.#onInvalidData = onInvalidData;
        this.#gameConnection.sendReady(name);
    }

    #mapEvents() {
        this.#eventMap = new Map();
        this.#eventMap.set('chatMessage', this.#onEventChatMessage)
        this.#eventMap.set('connected', this.#onConnected)
        this.#eventMap.set('error', this.#onEventError)
        this.#eventMap.set('move', this.#onEventMove)
        this.#eventMap.set('nextMove', this.#onEventNextMove)
        this.#eventMap.set('setMark', this.#onEventSetMark)
        this.#eventMap.set('status', this.#onEventStatus)
        this.#eventMap.set('playerLeaved', this.#onPlayerLeaved)
        this.#eventMap.set('disconnected', this.#onDisconnected)
        this.#eventMap.set('connectionError', this.#onConnectionError)
    }

    #onEventReceived(eventType, eventObject) {
        const handler = this.#eventMap.get(eventType);
        if (handler) {
            handler.bind(this)(eventObject);
        }
        else {
            console.log(`Didn't found handler for ${eventType} event`);
        }
    }

    #onConnected(e) {
        if (this.#connected) {
            this.#connected();
        }

        this.#gameMessageBoard.addInfo('Connection established');
    }

    #onDisconnected(e) {
        this.#gameMessageBoard.addWarning('Disconnected');
    }

    #onConnectionError(e) {
        this.#gameMessageBoard.addWarning(`Error occured: ${e}`);
    }

    /**
     * Called when error message received
     * @param {{errorType, message}} e
     */
    #onEventError(e) {
        console.log(`Error occured: ${e.message}`);
        if (e.errorType === "invalidPlayerData" && this.#onInvalidData) {
            this.#onInvalidData(e.message);
        }
    }

    /**
     * On chat message
     * @param {{senderName: string, message: string}} e
     */
    #onEventChatMessage(e) {
        console.log(`Chat: [${e.senderName}] ${e.message}`);
        this.#gameMessageBoard.addChatMessage(e.senderName, e.message);
    }

    /**
     * Called when gema status changed
     * @param {{gameStatus: string, statusObject: any}} e
     */
    #onEventStatus(e) {
        console.log(`Game status: ${e.gameStatus}`);

        const message = StatusMessages.get(e.gameStatus);
        if (message !== undefined) {
            this.#gameMessageBoard.addInfo(message);
        }

        if (e.gameStatus === 'finnished') {
            this.#onGameFinnished(e.statusObject);
        }
        else if (e.gameStatus === 'started') {
            this.#onGameStarted(e.statusObject);
        }
        else if (e.gameStatus === 'aborted') {
            this.#onGameAborted(e.statusObject);
        }

        this.#gameRenderer.setGameStatus(e.gameStatus);
    }

    /**
     * Called when the game is started
     * @param {Array.<{name: string, mark: string, }>} e
     */
    #onGameStarted(e) {
        let xPlayerName, oPlayerName;
        e.forEach((player, index) => {
            if (MarkEnum[player.mark] === MarkEnum.o) {
                oPlayerName = player.name;
            }
            else {
                xPlayerName = player.name;
            }
        });

        this.#gameRenderer.setPlayerNames(xPlayerName, oPlayerName);
    }

    /**
     * Called when the game is aborted
     * @param {{ reason: string, details: string }}} e
     */
    #onGameAborted(e) {
        this.#gameMessageBoard.addWarning("Game has been interrupted");
    }

    /**
     * Called when game is over
     * @param {{isDraw: boolean, winner: string, winningCells: Array.<number>}} gameResult
     */
    #onGameFinnished(gameResult) {
        this.#currentMarkMove = MarkEnum.nothing;
        this.#gameRenderer.setGameResult(gameResult);
        
        if (gameResult.isDraw) {
            this.#gameMessageBoard.addInfo("Draw");
        }
        else if (gameResult.winner) {
            this.#gameMessageBoard.addInfo(`'${gameResult.winner.toUpperCase()}' won the game`);
        }
    }

    /**
     * Called when next player can move
     * @param {{mark: string}} e
     */
    #onEventNextMove(e) {
        console.log(`Next move: ${e.mark}`);
        this.#currentMarkMove = MarkEnum[e.mark];
        this.#gameRenderer.setCurrentMarkMove(this.#currentMarkMove);
    }

    /**
     * Called when one of the playr made a move
     * @param {{mark: string, cell: number}} e
     */
    #onEventMove(e) {
        console.log(`Moved: ${e.mark} - ${e.cell}`);

        const mark = MarkEnum[e.mark]
        this.#board[e.cell] = mark;
        this.#gameRenderer.setMark(mark, e.cell);
    }

    /**
     * Called when mark is assigned to the player
     * @param {{makr: string}} e
     */
    #onEventSetMark(e) {
        console.log(`Mark assigned: ${e.mark}`);

        this.#gameRenderer.mark = this.#mark = MarkEnum[e.mark];
    }

    /**
     * Called when player moved
     * @param {number} cell - cell index
     */
    #onMove(cell) {
        console.log(`Moved: ${cell}`);

        if (!this.#canMove(cell)) {
            throw new Error('Cannot move');
        }

        this.#gameConnection.sendMove(cell, Object.keys(MarkEnum)[this.#mark]);
    }

    /**
     * Called when a player leaved the game
     * @param {{name: string}} e
     */
    #onPlayerLeaved(e) {
        this.#gameMessageBoard.addWarning(`Player '${e.name}' left the game`);
    }

    #canMove(cell) {
        let canMove = this.#currentMarkMove !== undefined
            && this.#currentMarkMove !== MarkEnum.nothing
            && this.#currentMarkMove == this.#mark;

        if (cell === undefined) {
            return canMove
        }

        return canMove && this.#board[cell] === MarkEnum.nothing;
    }
}

/* export { TikTakTok, MarkEnum }; */
