// Base Game Class - Common functionality for all games
import { GameConfig } from './config.js';
import StorageManager from './storage.js';
import AudioManager from './audioManager.js';

export class BaseGame {
    constructor(canvas, gameType) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameType = gameType;
        this.isPaused = false;
        this.isGameOver = false;
        this.score = 0;
        this.startTime = Date.now();
        this.animationFrame = null;
        this.eventListeners = [];
        this.timers = [];
        
        // Get settings from storage
        const settings = StorageManager.getSettings();
        this.difficulty = settings.difficulty || 'normal';
        
        // Initialize audio
        AudioManager.init();
    }

    // Setup canvas
    setupCanvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        return this.ctx;
    }

    // Event listener management
    addEventListenerTracked(element, event, handler) {
        const boundHandler = handler.bind(this);
        element.addEventListener(event, boundHandler);
        this.eventListeners.push({ element, event, handler: boundHandler });
        return boundHandler;
    }

    // Timer management
    setTimeoutTracked(callback, delay) {
        const timerId = setTimeout(() => {
            callback();
            this.timers = this.timers.filter(id => id !== timerId);
        }, delay);
        this.timers.push(timerId);
        return timerId;
    }

    setIntervalTracked(callback, delay) {
        const intervalId = setInterval(callback, delay);
        this.timers.push(intervalId);
        return intervalId;
    }

    // Start game loop
    start() {
        this.isGameOver = false;
        this.isPaused = false;
        this.lastUpdate = 0;
        this.startTime = Date.now();
        this.gameLoop(0);
    }

    // Game loop - to be called by child classes
    gameLoop(timestamp) {
        if (this.isGameOver) return;
        
        if (!this.isPaused) {
            const deltaTime = timestamp - (this.lastFrameTime || timestamp);
            this.update(deltaTime);
            this.draw();
        }
        
        this.lastFrameTime = timestamp;
        this.animationFrame = requestAnimationFrame(this.gameLoop.bind(this));
    }

    // Update - to be overridden by child classes
    update(deltaTime) {
        throw new Error('Update method must be implemented by child class');
    }

    // Draw - to be overridden by child classes
    draw() {
        throw new Error('Draw method must be implemented by child class');
    }

    // Pause game
    pause() {
        if (this.isGameOver) return;
        this.isPaused = true;
        this.drawPauseOverlay();
    }

    // Resume game
    resume() {
        if (this.isGameOver) return;
        this.isPaused = false;
        this.lastFrameTime = null;
    }

    // Toggle pause
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
        return this.isPaused;
    }

    // Draw pause overlay
    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press SPACE to resume', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    // Update score
    updateScore(points) {
        this.score += points;
        this.updateScoreDisplay();
        this.checkAchievements();
    }

    // Update score display
    updateScoreDisplay() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }

    // Check achievements - to be overridden
    checkAchievements() {
        // Override in child classes
    }

    // Game over
    gameOver() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Save stats
        StorageManager.updateStats(this.gameType, this.score, gameTime);
        
        // Check for high score
        const isNewHighScore = StorageManager.setHighScore(this.gameType, this.score);
        
        // Play game over sound
        AudioManager.play('collision');
        
        // Draw game over screen
        this.drawGameOverScreen(isNewHighScore);
    }

    // Draw game over screen
    drawGameOverScreen(isNewHighScore) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        this.ctx.font = '28px Arial';
        this.ctx.fillStyle = isNewHighScore ? '#f5a623' : '#ffffff';
        this.ctx.fillText(
            isNewHighScore ? '🎉 NEW HIGH SCORE! 🎉' : `Score: ${this.score}`,
            this.canvas.width / 2,
            this.canvas.height / 2 - 10
        );
        
        if (isNewHighScore) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(
                `Score: ${this.score}`,
                this.canvas.width / 2,
                this.canvas.height / 2 + 30
            );
        }
        
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillText(
            'Press ESC to return to menu',
            this.canvas.width / 2,
            this.canvas.height / 2 + 80
        );
        this.ctx.fillText(
            'Press R to restart',
            this.canvas.width / 2,
            this.canvas.height / 2 + 110
        );
    }

    // Clear canvas
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw grid
    drawGrid(cellSize, color = '#2a2a2a') {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.canvas.width; x += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    // Cleanup
    destroy() {
        // Cancel animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Clear all timers
        this.timers.forEach(timerId => {
            clearTimeout(timerId);
            clearInterval(timerId);
        });
        this.timers = [];
        
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // Clear canvas
        this.clearCanvas();
    }
}

export default BaseGame;