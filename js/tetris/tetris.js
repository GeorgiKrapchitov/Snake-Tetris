export default class Tetris {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = Utils.canvas.setupCanvas(this.canvas, 300, 600);
        this.blockSize = 30;
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.dropInterval = 1000; // Time in ms between piece drops
        this.lastDrop = 0;
        this.colors = {
            background: '#1a1a1a',
            grid: '#2a2a2a',
            pieces: [
                '#4a90e2', // I piece
                '#50e3c2', // J piece
                '#f5a623', // L piece
                '#ff4081', // O piece
                '#9013fe', // S piece
                '#bd10e0', // T piece
                '#7ed321'  // Z piece
            ]
        };
        this.pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 0, 0], [1, 1, 1]], // J
            [[0, 0, 1], [1, 1, 1]], // L
            [[1, 1], [1, 1]], // O
            [[0, 1, 1], [1, 1, 0]], // S
            [[0, 1, 0], [1, 1, 1]], // T
            [[1, 1, 0], [0, 1, 1]]  // Z
        ];
        this.setupGame();
    }

    setupGame() {
        // Bind the event handler to preserve the reference
        this.boundHandleKeyPress = this.handleKeyPress.bind(this);
        
        // Set up controls
        Utils.input.setupKeyboardControls(this.boundHandleKeyPress);
        if ('ontouchstart' in window) {
            Utils.input.setupTouchControls(this.canvas, this.handleSwipe.bind(this));
        }
        this.generateNewPiece();
    }

    start() {
        this.isGameOver = false;
        this.isPaused = false;
        this.lastDrop = 0;
        Utils.animation.startGameLoop(this.gameLoop.bind(this));
    }

    pause() {
        if (this.isGameOver) return;
        this.isPaused = true;
        Utils.animation.stopGameLoop();
        Utils.canvas.drawPauseOverlay(this.ctx, this.canvas.width, this.canvas.height);
    }

    resume() {
        if (this.isGameOver) return;
        this.isPaused = false;
        this.lastDrop = 0; // Reset drop timer
        Utils.animation.startGameLoop(this.gameLoop.bind(this));
    }

    destroy() {
        Utils.animation.stopGameLoop();
        // Remove event listeners
        document.removeEventListener('keydown', this.boundHandleKeyPress);
        // Clear the canvas
        Utils.canvas.clearCanvas(this.ctx, this.canvas.width, this.canvas.height);
    }

    handleKeyPress(e) {
        if (e.code === 'Space') {
            if (this.isPaused) {
                this.resume();
            } else {
                this.pause();
            }
            return;
        }

        if (this.isPaused) return;

        switch(e.key) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
        }
    }

    handleSwipe(direction) {
        if (this.isPaused || this.isGameOver) return;

        switch (direction) {
            case 'left':
                this.movePiece(-1, 0);
                break;
            case 'right':
                this.movePiece(1, 0);
                break;
            case 'down':
                this.movePiece(0, 1);
                break;
            case 'up':
                this.rotatePiece();
                break;
        }
    }

    handleControl(action) {
        if (this.isPaused || this.isGameOver) return;

        switch (action) {
            case 'left':
                this.movePiece(-1, 0);
                break;
            case 'right':
                this.movePiece(1, 0);
                break;
            case 'down':
                this.movePiece(0, 1);
                break;
            case 'rotate':
                this.rotatePiece();
                break;
        }
    }

    gameLoop(deltaTime) {
        if (this.isPaused || this.isGameOver) {
            if (this.isPaused) {
                Utils.canvas.drawPauseOverlay(this.ctx, this.canvas.width, this.canvas.height);
            }
            return;
        }

        this.lastDrop += deltaTime;
        if (this.lastDrop >= this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
                this.clearLines();
                if (!this.generateNewPiece()) {
                    this.gameOver();
                    return;
                }
            }
            this.lastDrop = 0;
        }
        this.draw();
    }

    draw() {
        Utils.canvas.clearCanvas(this.ctx, this.canvas.width, this.canvas.height);

        // Draw board
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.colors.pieces[this.board[y][x] - 1]);
                }
            }
        }

        // Draw current piece
        if (this.currentPiece) {
            const piece = this.pieces[this.currentPiece.type];
            piece.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.colors.pieces[this.currentPiece.type]
                        );
                    }
                });
            });
        }

        // Draw grid
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.boardWidth; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.blockSize, 0);
            this.ctx.lineTo(i * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.boardHeight; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.blockSize);
            this.ctx.lineTo(this.canvas.width, i * this.blockSize);
            this.ctx.stroke();
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.blockSize,
            y * this.blockSize,
            this.blockSize - 1,
            this.blockSize - 1
        );
    }

    generateNewPiece() {
        const type = Math.floor(Math.random() * this.pieces.length);
        const piece = this.pieces[type];
        const x = Math.floor((this.boardWidth - piece[0].length) / 2);
        const y = 0;

        this.currentPiece = { type, x, y };

        // Check if the new piece can be placed
        return this.isValidMove(0, 0);
    }

    movePiece(dx, dy) {
        if (!this.currentPiece) return false;

        if (this.isValidMove(dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
            return true;
        }
        return false;
    }

    rotatePiece() {
        if (!this.currentPiece || this.pieces[this.currentPiece.type].length === 2) return; // Don't rotate O piece

        const piece = this.pieces[this.currentPiece.type];
        const newPiece = piece[0].map((_, i) => piece.map(row => row[i]).reverse());

        const originalPiece = this.pieces[this.currentPiece.type];
        this.pieces[this.currentPiece.type] = newPiece;

        if (!this.isValidMove(0, 0)) {
            // Try wall kicks
            const kicks = [-1, 1, -2, 2];
            let kicked = false;

            for (const kick of kicks) {
                if (this.isValidMove(kick, 0)) {
                    this.currentPiece.x += kick;
                    kicked = true;
                    break;
                }
            }

            if (!kicked) {
                this.pieces[this.currentPiece.type] = originalPiece;
            }
        }
    }

    isValidMove(dx, dy) {
        const piece = this.pieces[this.currentPiece.type];
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;

        return piece.every((row, y) =>
            row.every((value, x) =>
                !value || // Empty space in piece
                (
                    newX + x >= 0 && // Left boundary
                    newX + x < this.boardWidth && // Right boundary
                    newY + y >= 0 && // Top boundary
                    newY + y < this.boardHeight && // Bottom boundary
                    !this.board[newY + y][newX + x] // No collision with placed pieces
                )
            )
        );
    }

    placePiece() {
        const piece = this.pieces[this.currentPiece.type];
        piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.board[this.currentPiece.y + y][this.currentPiece.x + x] = this.currentPiece.type + 1;
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.boardHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                // Remove the line
                this.board.splice(y, 1);
                // Add new empty line at top
                this.board.unshift(Array(this.boardWidth).fill(0));
                linesCleared++;
                y++; // Check the same row again
            }
        }

        if (linesCleared > 0) {
            Utils.score.updateScore(linesCleared * 100);
            // Increase speed slightly
            this.dropInterval = Math.max(100, this.dropInterval - 10);
        }
    }

    gameOver() {
        this.isGameOver = true;
        Utils.animation.stopGameLoop();
        
        // Draw game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText(
            `Score: ${Utils.score.currentScore}`,
            this.canvas.width / 2,
            this.canvas.height / 2 + 40
        );
        this.ctx.fillText(
            'Press any key to return to menu',
            this.canvas.width / 2,
            this.canvas.height / 2 + 80
        );

        // Add one-time event listener for returning to menu
        const returnToMenu = () => {
            document.removeEventListener('keydown', returnToMenu);
            gameState.endGame();
        };
        document.addEventListener('keydown', returnToMenu);
    }
} 