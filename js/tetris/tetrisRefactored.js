// Tetris Game - Refactored with BaseGame
import BaseGame from '../baseGame.js';
import { GameConfig } from '../config.js';
import AudioManager from '../audioManager.js';
import { AchievementManager } from '../achievementManager.js';

export default class Tetris extends BaseGame {
    constructor(canvas) {
        super(canvas, 'tetris');
        
        // Get difficulty settings
        const difficultyConfig = GameConfig.difficulty[this.difficulty].tetris;
        
        // Game state
        this.blockSize = GameConfig.visual.blockSize;
        this.boardWidth = GameConfig.mechanics.tetris.boardWidth;
        this.boardHeight = GameConfig.mechanics.tetris.boardHeight;
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.currentPiece = null;
        this.dropInterval = difficultyConfig.dropInterval;
        this.lastDrop = 0;
        this.colors = GameConfig.visual.colors;
        this.linesCleared = 0;
        
        // Tetromino shapes
        this.pieces = [
            [[1, 1, 1, 1]], // I
            [[1, 0, 0], [1, 1, 1]], // J
            [[0, 0, 1], [1, 1, 1]], // L
            [[1, 1], [1, 1]], // O
            [[0, 1, 1], [1, 1, 0]], // S
            [[0, 1, 0], [1, 1, 1]], // T
            [[1, 1, 0], [0, 1, 1]]  // Z
        ];
        
        // Achievement manager
        this.achievementManager = new AchievementManager('tetris');
        
        // Setup canvas
        this.setupCanvas(
            GameConfig.visual.canvasWidth.tetris,
            GameConfig.visual.canvasHeight
        );
        
        // Initialize game
        this.setupGame();
    }

    setupGame() {
        // Setup controls
        this.boundHandleKeyPress = this.addEventListenerTracked(
            document,
            'keydown',
            this.handleKeyPress
        );
        
        // Touch controls for mobile
        if ('ontouchstart' in window) {
            this.setupTouchControls();
        }
        
        this.generateNewPiece();
    }

    handleKeyPress(e) {
        // Handle pause
        if (e.code === 'Space' && !this.isGameOver) {
            e.preventDefault();
            this.togglePause();
            return;
        }
        
        // Handle restart
        if (e.key === 'r' || e.key === 'R') {
            if (this.isGameOver) {
                this.restart();
            }
            return;
        }
        
        // Handle return to menu
        if (e.key === 'Escape') {
            if (this.isGameOver) {
                this.returnToMenu();
            }
            return;
        }
        
        if (this.isPaused || this.isGameOver) return;
        
        e.preventDefault();
        
        // Handle game controls
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.movePiece(-1, 0);
                AudioManager.play('move');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.movePiece(1, 0);
                AudioManager.play('move');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.movePiece(0, 1)) {
                    this.updateScore(1); // Bonus for soft drop
                }
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.rotatePiece();
                AudioManager.play('rotate');
                break;
        }
    }

    setupTouchControls() {
        let touchStartX = null;
        let touchStartY = null;
        
        this.addEventListenerTracked(this.canvas, 'touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.addEventListenerTracked(this.canvas, 'touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        this.movePiece(1, 0);
                    } else {
                        this.movePiece(-1, 0);
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 0) {
                        this.movePiece(0, 1);
                    } else {
                        this.rotatePiece();
                    }
                }
            } else {
                // Tap to rotate
                this.rotatePiece();
            }
            
            touchStartX = null;
            touchStartY = null;
        });
    }

    update(deltaTime) {
        if (this.isPaused || this.isGameOver) return;
        
        this.lastDrop += deltaTime;
        
        if (this.lastDrop >= this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.placePiece();
                const cleared = this.clearLines();
                
                if (cleared > 0) {
                    AudioManager.play('lineClear');
                    this.linesCleared += cleared;
                    
                    // Calculate score based on lines cleared
                    const baseScore = GameConfig.mechanics.tetris.scorePerLine;
                    const multiplier = [0, 1, 2.5, 4, 8][cleared] || 1; // Bonus for multiple lines
                    this.updateScore(Math.floor(baseScore * multiplier));
                    
                    // Speed up
                    this.dropInterval = Math.max(
                        GameConfig.mechanics.tetris.minDropInterval,
                        this.dropInterval - GameConfig.mechanics.tetris.speedIncreasePerLine
                    );
                    
                    // Check achievements
                    this.achievementManager.check('first', this.linesCleared);
                    this.achievementManager.check('lines', this.linesCleared);
                }
                
                if (!this.generateNewPiece()) {
                    this.gameOver();
                    return;
                }
            }
            this.lastDrop = 0;
        }
    }

    draw() {
        this.clearCanvas();
        
        // Draw board
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.colors.tetrisPieces[this.board[y][x] - 1]);
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
                            this.colors.tetrisPieces[this.currentPiece.type]
                        );
                    }
                });
            });
            
            // Draw ghost piece (preview where piece will land)
            this.drawGhostPiece();
        }
        
        // Draw grid
        this.drawGrid(this.blockSize, this.colors.grid);
        
        // Draw pause overlay if paused
        if (this.isPaused) {
            this.drawPauseOverlay();
        }
    }

    drawBlock(x, y, color) {
        const px = x * this.blockSize;
        const py = y * this.blockSize;
        
        // Main block
        this.ctx.fillStyle = color;
        this.ctx.fillRect(px + 1, py + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(px + 2, py + 2, this.blockSize - 6, this.blockSize - 6);
        
        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(px + this.blockSize - 6, py + 6, 4, this.blockSize - 8);
    }

    drawGhostPiece() {
        if (!this.currentPiece) return;
        
        // Find where piece would land
        let ghostY = this.currentPiece.y;
        while (this.isValidMove(0, ghostY - this.currentPiece.y + 1)) {
            ghostY++;
        }
        
        // Draw ghost
        const piece = this.pieces[this.currentPiece.type];
        this.ctx.globalAlpha = 0.3;
        piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    const px = (this.currentPiece.x + x) * this.blockSize;
                    const py = (ghostY + y) * this.blockSize;
                    this.ctx.strokeStyle = this.colors.tetrisPieces[this.currentPiece.type];
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(px + 2, py + 2, this.blockSize - 4, this.blockSize - 4);
                }
            });
        });
        this.ctx.globalAlpha = 1.0;
    }

    generateNewPiece() {
        const type = Math.floor(Math.random() * this.pieces.length);
        const piece = this.pieces[type];
        const x = Math.floor((this.boardWidth - piece[0].length) / 2);
        const y = 0;
        
        this.currentPiece = { type, x, y };
        
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
        if (!this.currentPiece) return;
        
        // Don't rotate O piece
        if (this.pieces[this.currentPiece.type].length === 2 && 
            this.pieces[this.currentPiece.type][0].length === 2) {
            return;
        }
        
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
                !value || (
                    newX + x >= 0 &&
                    newX + x < this.boardWidth &&
                    newY + y >= 0 &&
                    newY + y < this.boardHeight &&
                    !this.board[newY + y][newX + x]
                )
            )
        );
    }

    placePiece() {
        const piece = this.pieces[this.currentPiece.type];
        piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.board[this.currentPiece.y + y][this.currentPiece.x + x] = 
                        this.currentPiece.type + 1;
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.boardHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.boardWidth).fill(0));
                linesCleared++;
                y++; // Check same row again
            }
        }
        
        return linesCleared;
    }

    restart() {
        // Reset game state
        this.score = 0;
        this.linesCleared = 0;
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.isGameOver = false;
        this.isPaused = false;
        
        // Reset drop interval
        const difficultyConfig = GameConfig.difficulty[this.difficulty].tetris;
        this.dropInterval = difficultyConfig.dropInterval;
        
        // Reset achievement manager
        this.achievementManager.reset();
        
        // Re-setup game
        this.setupGame();
        
        // Restart
        this.start();
    }

    returnToMenu() {
        window.dispatchEvent(new CustomEvent('returnToMenu'));
    }

    checkAchievements() {
        this.achievementManager.check('score', this.score);
    }
}
