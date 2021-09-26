import { TikTakTok } from "./TikTakTok.js"
import '../css/main.css';
import dialogPolyfill from "dialog-polyfill"

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    const messageBoard = document.getElementById('gameMessages');
    const dialog = document.getElementById('startDialog');
    dialogPolyfill.registerDialog(dialog);
    const nameInput = document.getElementById('dialogName');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const dialogError = document.getElementById('dialogErrorMessage');
    const game = new TikTakTok(canvas, messageBoard);
    
    sendBtn.addEventListener('click', (e) => {
        const message = chatInput.value;
        if (message !== undefined && message.length > 0) {
            game.sendChatMessage(chatInput.value);
            chatInput.value = '';
        }
    });
    
    chatInput.addEventListener('keydown', (e) => {
        if (e.keyCode == 13) {
            game.sendChatMessage(chatInput.value);
            chatInput.value = '';
        }
    });

    game.connect(() => dialog.showModal());

    dialog.addEventListener('close', (e) => {
        if (nameInput.value) {
            game.ready(nameInput.value, (e) => {
                dialogError.innerText = e;
                dialog.showModal();
            });
        }
        else {
            dialog.showModal();
        }
    });
}

if (document.readyState !== 'loading') {
    initGame();
} else {
    document.addEventListener('DOMContentLoaded', () => initGame());
}