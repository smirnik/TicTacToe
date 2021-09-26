class GameMessageBoard {

    #messageBoard;

    constructor(s) {
        this.#messageBoard = s;
    }

    addChatMessage(sender, message) {
        const template = `<p class="chat-message">${this.#getTime()} <span class="chat-message-name">${sender}:</span> <span>${message}</span></p>`;
        this.#addItem(template);
    }

    addInfo(message) {
        const template = `<p class="chat-message chat-message-info">${this.#getTime()} <span>${message}</span></p>`;
        this.#addItem(template);
    }

    addWarning(warning) {
        const template = `<p class="chat-message chat-message-warning">${this.#getTime()} <span>${warning}</span></p>`;
        this.#addItem(template);
    }

    #getTime() {
        return `<span class="chat-message-time">[${new Date().toLocaleTimeString()}]</span>`;
    }

    #addItem(html) {
        this.#messageBoard.insertAdjacentHTML("beforeend", html);
    }
}

export default GameMessageBoard;