import { MarkEnum } from "./TikTakTok.js";

const colors = {
    x: "#ef476f",
    o: "#118ab2",
    inactivePlayer: "#a9adb3",
    playerName: "black",
    movingPlayerLine: "#FFB900",
    line: "#073b4c",
    move: "#ffd166",
    wonLine: "rgba(6, 214, 160, 0.7)",
    messageBackground: "rgba(0, 187, 255, 0.6)",
};

class GameRenderer {
    constructor(canvas, board, onMove, canMove) {
        this.#board = board;
        this.#loadImages();
        this.#onMove = onMove;
        this.#canMove = canMove;
        this.mark = MarkEnum.Nothing;

        this.#initCanvas(canvas);
    }

    #ctx;
    #board;
    #onMove;
    #canMove;

    #xPlayerName;
    #oPlayerName;

    #width;
    #height;

    #cellSize;
    #cellMargin;
    #boardTop;
    #boardLeft;
    #boardBottom;
    #boardRight;
    #boardMargin = 10;
    #boardLineWidth = 2;
    #boardMarkLineWidth = 4;
    #boardWinningLineWidth = 6;

    #playersPanelMargin = 5;
    #playersPanelTop;
    #playersPanelLeft;
    #playersPanelHeight;
    #playersPanelWidth;
    #playersPanelMarkLineWidth = 8;

    #mouseOverCell;
    #mouseDownCell;

    #imageCrown;

    setPlayerNames(xName, oName) {
        this.#xPlayerName = xName;
        this.#oPlayerName = oName;
        this.#drawPlayers(MarkEnum.nothing);
    }

    setCurrentMarkMove(mark) {
        this.#drawPlayers(mark);
    }

    /**
     * @param {{isDraw: boolean, winner: string, winningCells: Array.<number>}} result 
     */
    setGameResult(result) {
        if (result.winningCells && 3 === result.winningCells.length) {
            this.#drawWinningLine(result.winningCells[0], result.winningCells[2]);
        }
        var winner = MarkEnum[result.winner];
        this.#drawPlayers(winner, result.isDraw, winner);
    }

    /**
     * @param {MarkEnum} mark 
     * @param {number} cell Cell index
     */
    setMark(mark, cell) {
        const { row, col } = this.#getRowAndColByCell(cell);
        this.#drawMark(mark, row, col);
    }

    /**
     * @param {string} status 
     */
    setGameStatus(status) {
        if ("waitingForSecondPlayer" === status) {
            this.#drawMessage("Waiting...");
        }
    }

    #drawMessage(message, color) {
        const textHeight = Math.min(Math.trunc(this.#playersPanelHeight / 3), 42);
        const middleX = Math.trunc(this.#playersPanelLeft + this.#playersPanelWidth / 2);
        const middleY = Math.trunc(this.#playersPanelTop + this.#playersPanelHeight / 2);

        this.#ctx.font = `${textHeight}px sans-serif`;
        this.#ctx.fillStyle = color ?? "black";
        this.#ctx.textBaseline = "middle";
        this.#ctx.textAlign = "center";
        this.#ctx.save();

        const textWidth = this.#ctx.measureText(message).width;
        const halfTextWidth = Math.trunc(textWidth / 2);
        const margin = 5;
        this.#ctx.fillStyle = colors.messageBackground;
        this.#ctx.fillRect(middleX - halfTextWidth - margin, middleY - Math.trunc(textHeight / 2) - margin, textWidth + margin * 2, textHeight + margin * 2),

            this.#ctx.restore();
        this.#ctx.fillText(message, middleX, middleY);
    }

    #initCanvas(canvas) {
        var ctx = canvas.getContext("2d");

        this.#ctx = ctx;
        this.#width = ctx.canvas.width;
        this.#height = ctx.canvas.height;

        const playersAreaHeight = Math.min(this.#height - this.#width, 120);
        let boardSize = Math.min(this.#width, this.#height - playersAreaHeight);

        const playersPanelTop = Math.trunc((this.#height - playersAreaHeight - boardSize) / 2);
        this.#playersPanelTop = playersPanelTop + this.#playersPanelMargin;
        this.#playersPanelHeight = playersAreaHeight - 2 * this.#playersPanelMargin;
        this.#playersPanelLeft = this.#playersPanelMargin;
        this.#playersPanelWidth = this.#width - 2 * this.#playersPanelMargin;

        boardSize -= this.#boardMargin * 2;
        this.#boardTop = this.#boardMargin + playersAreaHeight;
        this.#boardBottom = this.#boardTop + boardSize;
        this.#boardLeft = Math.trunc((this.#width - boardSize) / 2);
        this.#boardRight = this.#boardLeft + boardSize;
        this.#cellSize = Math.trunc(boardSize / 3);
        this.#cellMargin = Math.trunc(0.2 * this.#cellSize);

        this.#subscribe(canvas);
        this.#drawLines();
        this.#drawPlayers(MarkEnum.nothing);
    }

    #loadImages() {
        this.#imageCrown = new Promise((resolve, reject) => {
            const image = new Image(42, 42);
            image.addEventListener("load", (e) => {
                resolve(image);
            });

            let url = new URL("../images/crown.svg", import.meta.url);
            image.src = url;
        });
    }

    async #drawPlayers(currentMark, isDraw, winnerMark) {
        this.#ctx.clearRect(
            this.#playersPanelLeft,
            this.#playersPanelTop,
            this.#playersPanelWidth,
            this.#playersPanelHeight
        );

        const gap = Math.min(Math.trunc(0.1 * this.#playersPanelHeight), 10);
        const halfWidth = Math.trunc(this.#playersPanelWidth / 2);
        const quarterWidth = Math.trunc(this.#playersPanelWidth / 4);
        const textHeight = Math.min(Math.trunc((this.#playersPanelHeight - gap) / 3), 40);
        const markSize = Math.min(Math.trunc(0.6 * (this.#playersPanelHeight - textHeight - gap)), halfWidth, 42);
        const crownSize = Math.trunc((markSize / 6) * 4);
        const contentHeight = crownSize + markSize + textHeight + gap;
        const middleY = this.#playersPanelTop + Math.trunc((this.#playersPanelHeight - contentHeight) / 2);
        const markXOffset = Math.trunc(quarterWidth - markSize / 2);

        let y = middleY + crownSize;

        //Draw marks
        let color = (currentMark === MarkEnum.x || isDraw) ? colors.x : colors.inactivePlayer;
        this.#drawX(this.#playersPanelLeft + markXOffset, y, markSize, this.#playersPanelMarkLineWidth, color);
        color = (currentMark === MarkEnum.o || isDraw) ? colors.o : colors.inactivePlayer;
        this.#drawO(this.#playersPanelLeft + halfWidth + markXOffset, y, markSize, this.#playersPanelMarkLineWidth, color);
        y += markSize + gap;

        //Draw player names
        if (this.#xPlayerName) {
            const underlined = !isDraw && currentMark === MarkEnum.x;
            color = (currentMark === MarkEnum.x || isDraw || winnerMark === MarkEnum.x)
                ? colors.playerName
                : colors.inactivePlayer;
            this.#drawPlayerName(this.#xPlayerName, this.#playersPanelLeft + Math.trunc(halfWidth / 2), y, textHeight, color, underlined);
        }

        if (this.#oPlayerName) {
            const underlined = !isDraw && currentMark === MarkEnum.o;
            color = (currentMark === MarkEnum.o || isDraw || winnerMark === MarkEnum.o)
                ? colors.playerName
                : colors.inactivePlayer;
            this.#drawPlayerName(this.#oPlayerName, this.#playersPanelLeft + halfWidth + Math.trunc(halfWidth / 2), y, textHeight, color, underlined);
        }

        //Draw - crown in the middle
        if (isDraw) {
            let img = await this.#imageCrown;
            this.#ctx.drawImage(img,
                this.#playersPanelLeft + halfWidth - Math.trunc(crownSize / 2), Math.trunc((middleY + contentHeight) / 2),
                crownSize, crownSize);
        }
        //Winner - crown above mark
        else if (winnerMark) {
            const x = (winnerMark === MarkEnum.x)
                ? Math.trunc(this.#playersPanelLeft + quarterWidth - crownSize / 2)
                : Math.trunc(this.#playersPanelLeft + halfWidth + quarterWidth - crownSize / 2);
            let img = await this.#imageCrown;
            this.#ctx.drawImage(img,
                x, middleY,
                crownSize, crownSize);
        }
    }

    #drawPlayerName(name, x, y, textHeight, color, underlined) {
        this.#ctx.font = `${textHeight}px sans-serif`;
        this.#ctx.fillStyle = color ?? "black";
        this.#ctx.textBaseline = "top";
        this.#ctx.textAlign = "center";
        this.#ctx.fillText(name, x, y);

        if (underlined) {
            const textHalfWidth = Math.trunc(this.#ctx.measureText(name).width / 2);
            this.#ctx.beginPath();
            this.#ctx.lineWidth = 2;
            this.#ctx.strokeStyle = colors.movingPlayerLine;
            this.#ctx.moveTo(x - textHalfWidth, y + textHeight);
            this.#ctx.lineTo(x + textHalfWidth, y + textHeight);
            this.#ctx.stroke();
        }
    }

    #drawX(x, y, size, lineWidth, color = colors.x) {
        this.#ctx.beginPath();
        this.#ctx.lineCap = "round";
        this.#ctx.strokeStyle = color;
        this.#ctx.lineWidth = lineWidth;

        this.#ctx.beginPath();
        this.#ctx.moveTo(x, y);
        this.#ctx.lineTo(x + size, y + size);
        this.#ctx.moveTo(x + size, y);
        this.#ctx.lineTo(x, y + size);
        this.#ctx.stroke();
    }

    #drawO(x, y, size, lineWidth, color = colors.o) {
        const radius = Math.trunc(size / 2);
        this.#ctx.beginPath();
        this.#ctx.strokeStyle = color;
        this.#ctx.lineWidth = lineWidth;
        this.#ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
        this.#ctx.stroke();
    }

    #subscribe(canvas) {

        canvas.addEventListener("mouseleave", (e) => {
            if (this.#mouseOverCell >= 0 && this.#board[this.#mouseOverCell] === MarkEnum.nothing) {
                this.#clearCell(this.#mouseOverCell);
            }
            this.#mouseOverCell = undefined;
        });

        canvas.addEventListener("mousemove", (e) => {
            this.#onMouseMove(e);
        });

        canvas.addEventListener("mousedown", (e) => {
            const cellInfo = this.#getCell(e.offsetX, e.offsetY);
            if (cellInfo && this.#canMove(cellInfo.cell)) {
                this.#mouseDownCell = cellInfo.cell;
            }
        });

        canvas.addEventListener("mouseup", (e) => {
            const cellInfo = this.#getCell(e.offsetX, e.offsetY);
            if (cellInfo && this.#mouseDownCell === cellInfo.cell && this.#canMove(cellInfo.cell)) {
                this.#onMove(cellInfo.cell)
            }
            this.#mouseDownCell = undefined
        });
    }

    #onMouseMove(e) {
        const x = e.offsetX;
        const y = e.offsetY;

        let row, col, cell;
        const cellInfo = this.#getCell(x, y);
        if (cellInfo) {
            ({ row, col, cell } = cellInfo);
        }

        //clear previous cell
        if (this.#canMove() && this.#mouseOverCell != cell && this.#mouseOverCell >= 0 && this.#board[this.#mouseOverCell] === MarkEnum.nothing) {
            this.#clearCell(this.#mouseOverCell);
        }

        //draw mouse over cell
        if (cell >= 0 && this.#canMove(cell)) {
           this.#drawMark(this.mark, row, col, colors.move);
            this.#mouseOverCell = cell;
        }
        else {
            this.#mouseOverCell = undefined;
        }
    }

    /**
     * Get cell info by coordinates
     * @param {number} x 
     * @param {number} y 
     * @returns {{row: number, col: number, cell: number}} Cell info
     */
    #getCell(x, y) {
        if (x > this.#boardLeft && x < this.#boardRight &&
            y > this.#boardTop && y < this.#boardBottom) {

            const col = Math.trunc((x - this.#boardLeft) / this.#cellSize);
            const row = Math.trunc((y - this.#boardTop) / this.#cellSize);
            return {
                row,
                col,
                cell: Math.trunc(3 * row + col)
            };
        }

        return null;
    }

    #drawMark(mark, row, col, color) {
        const halfLineWidth = Math.trunc(this.#boardMarkLineWidth / 2)
        const x = this.#boardLeft + col * this.#cellSize + this.#cellMargin;
        const y = this.#boardTop + row * this.#cellSize + this.#cellMargin;
        const size = this.#cellSize - this.#cellMargin * 2;

        if (mark == MarkEnum.x) {
            this.#drawX(x, y, size, this.#boardMarkLineWidth, color);
        }
        else {
            this.#drawO(x, y, size, this.#boardMarkLineWidth, color);
        }
    }

    /**
     * Get cell's row and column by index
     * @param {number} cell Cell index
     * @returns {{row: number, col:number}} Row and col
     */
    #getRowAndColByCell(cell) {
        return {
            row: Math.trunc(cell / 3),
            col: cell % 3
        };
    }

    #clearCell(cell) {
        const { row, col } = this.#getRowAndColByCell(cell);
        const x = this.#boardLeft + col * this.#cellSize + this.#cellMargin - this.#boardMarkLineWidth;
        const y = this.#boardTop + row * this.#cellSize + this.#cellMargin - this.#boardMarkLineWidth;
        const size = this.#cellSize - 2 * this.#cellMargin + this.#boardMarkLineWidth * 2;
        this.#ctx.clearRect(x, y, size, size);
    }

    #drawLines() {
        this.#ctx.beginPath(),
            this.#ctx.lineCap = "round";
        this.#ctx.lineWidth = this.#boardLineWidth;
        this.#ctx.strokeStyle = colors.line;
        let x, y;
        //vertical lines
        for (let col = 1; col <= 2; col++) {
            x = this.#boardLeft + this.#cellSize * col;
            this.#ctx.moveTo(x, this.#boardTop);
            this.#ctx.lineTo(x, this.#boardBottom);
        }

        //horizontal lines
        for (let row = 1; row <= 2; row++) {
            y = this.#boardTop + this.#cellSize * row;
            this.#ctx.moveTo(this.#boardLeft, y);
            this.#ctx.lineTo(this.#boardRight, y);
        }
        this.#ctx.stroke();
    }

    /**
     * Get cell's center coordinates by row and column
     * @param {number} row 
     * @param {number} col 
     * @returns {{x:number, y:number}} 
     */
    #getCellCenter(row, col) {
        return {
            x: this.#boardLeft + col * this.#cellSize + Math.trunc(this.#cellSize / 2),
            y: this.#boardTop + row * this.#cellSize + Math.trunc(this.#cellSize / 2),
        };
    }

    #drawWinningLine(cellFrom, cellTo) {
        const { row: rowFrom, col: colFrom } = this.#getRowAndColByCell(cellFrom);
        const { row: rowTo, col: colTo } = this.#getRowAndColByCell(cellTo);
        const { x: xFrom, y: yFrom } = this.#getCellCenter(rowFrom, colFrom);
        const { x: xTo, y: yTo } = this.#getCellCenter(rowTo, colTo);

        this.#ctx.beginPath(),
            this.#ctx.strokeStyle = colors.wonLine;
        this.#ctx.lineWidth = this.#boardWinningLineWidth;
        this.#ctx.lineCap = "round";
        this.#ctx.moveTo(xFrom, yFrom);
        this.#ctx.lineTo(xTo, yTo);
        this.#ctx.stroke();
    }
}
export default GameRenderer;
