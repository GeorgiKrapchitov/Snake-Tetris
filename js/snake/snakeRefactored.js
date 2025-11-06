// Snake Game - Refactored with BaseGame
import BaseGame from '../baseGame.js';
import { GameConfig } from '../config.js';
import AudioManager from '../audioManager.js';
import { AchievementManager } from '../achievementManager.js';

export default class Snake extends BaseGame {
    constructor(canvas) {
        super(canvas, 'snake');
        
        // Get difficulty settings
        const difficultyConfig = GameConfig.difficulty[this.difficulty].snake;
        
        // Game state
        this.gridSize = GameConfig.visual.gridSize;
        this.snake = [];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.food = null;
        this.powerUp = null;
        this.speed = difficultyConfig.speed;
        this.lastUpdate = 0;
        this.colors = GameConfig.visual.colors;
        this.powerUpTypes = ['speed', 'points', 'slow'];
        this.foodEaten = 0;
        this.powerUpsCollected = 0;
        
        // Achievement manager
        this.achievementManager = new AchievementManager('snake');
        
        // Setup canvas
        this.setupCanvas(
            GameConfig.visual.canvasWidth.snake,
            GameConfig.visual.canvasHeight
        );
        
        // Initialize game
        this.setupGame();
    }

    setupGame() {
        // Initialize snake in the middle
        const startX = Math.floor(this.canvas.width / (2 * this.gridSize)) * this.gridSize;
        const startY = Math.floor(this.canvas.height / (2 * this.gridSize)) * this.gridSize;
        
        this.snake = [];
        for (let i = 0; i < GameConfig.mechanics.snake.initialLength; i++) {
            this.snake.push({
                x: startX - (i * this.gridSize),
                y: startY
            });
        }
        
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
        
        this.spawnFood();
        this.schedulePowerUp();
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
        
        // Handle direction changes
        const keyMap = {
            'ArrowUp': 'up', 'w': 'up', 'W': 'up',
            'ArrowDown': 'down', 's': 'down', 'S': 'down',
            'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
            'ArrowRight': 'right', 'd': 'right', 'D': 'right'
        };
        
        const direction = keyMap[e.key];
        if (direction) {
            e.preventDefault();
            this.handleDirection(direction);
        }
    }

    handleDirection(direction) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        // Prevent 180-degree turns
        if (this.direction !== opposites[direction]) {
            this.nextDirection = direction;
        }
    }

    setupTouchControls() {
        let touchStartX = null;
        let touchStartY = null;
        
        this.addEventListenerTracked(this.canvas, 'touchstart', (e) => {
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
                const direction = Math.abs(deltaX) > Math.abs(deltaY)
                    ? (deltaX > 0 ? 'right' : 'left')
                    : (deltaY > 0 ? 'down' : 'up');
                this.handleDirection(direction);
            }
            
            touchStartX = null;
            touchStartY = null;
        });
    }

    update(deltaTime) {
        if (this.isPaused || this.isGameOver) return;
        
        this.lastUpdate += deltaTime;
        
        if (this.lastUpdate >= this.speed) {
            this.direction = this.nextDirection;
            const head = { ...this.snake[0] };
            
            // Update head position
            switch (this.direction) {
                case 'up': head.y -= this.gridSize; break;
                case 'down': head.y += this.gridSize; break;
                case 'left': head.x -= this.gridSize; break;
                case 'right': head.x += this.gridSize; break;
            }
            
            // Check collisions
            if (this.checkCollision(head)) {
                this.gameOver();
                return;
            }
            
            // Add new head
            this.snake.unshift(head);
            
            // Check food collision
            if (head.x === this.food.x && head.y === this.food.y) {
                this.foodEaten++;
                this.updateScore(GameConfig.mechanics.snake.scorePerFood);
                AudioManager.play('food');
                this.spawnFood();
                
                // Check achievements
                this.achievementManager.check('first', this.foodEaten);
                this.achievementManager.check('score', this.score);
                this.achievementManager.check('length', this.snake.length);
            } else {
                this.snake.pop();
            }
            
            // Check power-up collision
            if (this.powerUp && head.x === this.powerUp.x && head.y === this.powerUp.y) {
                this.powerUpsCollected++;
                this.applyPowerUp();
                AudioManager.play('powerUp');
                
                // Check achievements
                this.achievementManager.check('powerup', this.powerUpsCollected);
            }
            
            this.lastUpdate = 0;
        }
    }

    draw() {
        this.clearCanvas();
        
        // Draw grid
        this.drawGrid(this.gridSize, this.colors.grid);
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            const color = index === 0 ? this.colors.snakeHead : this.colors.snake;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(
                segment.x + 1,
                segment.y + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // Add shine effect to head
            if (index === 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fillRect(
                    segment.x + 2,
                    segment.y + 2,
                    this.gridSize - 8,
                    this.gridSize - 8
                );
            }
        });
        
        // Draw food
        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x + this.gridSize / 2,
            this.food.y + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Add pulse effect to food
        const pulseSize = Math.sin(Date.now() / 200) * 2;
        this.ctx.strokeStyle = this.colors.food;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x + this.gridSize / 2,
            this.food.y + this.gridSize / 2,
            this.gridSize / 2 + pulseSize,
            0,
            Math.PI * 2
        );
        this.ctx.stroke();
        
        // Draw power-up
        if (this.powerUp) {
            this.ctx.fillStyle = this.colors.powerUp;
            this.ctx.beginPath();
            this.ctx.arc(
                this.powerUp.x + this.gridSize / 2,
                this.powerUp.y + this.gridSize / 2,
                this.gridSize / 2 - 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Add star effect
            this.drawStar(
                this.powerUp.x + this.gridSize / 2,
                this.powerUp.y + this.gridSize / 2,
                5,
                this.gridSize / 3,
                this.gridSize / 6
            );
        }
        
        // Draw pause overlay if paused
        if (this.isPaused) {
            this.drawPauseOverlay();
        }
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }
        
        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fill();
    }

    checkCollision(head) {
        // Wall collision
        if (
            head.x < 0 ||
            head.x >= this.canvas.width ||
            head.y < 0 ||
            head.y >= this.canvas.height
        ) {
            return true;
        }
        
        // Self collision
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    spawnFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)) * this.gridSize,
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)) * this.gridSize
            };
        } while (
            this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
            (this.powerUp && this.powerUp.x === newFood.x && this.powerUp.y === newFood.y)
        );
        this.food = newFood;
    }

    schedulePowerUp() {
        const spawnDelay = GameConfig.mechanics.snake.powerUpSpawnDelay;
        const lifetime = GameConfig.mechanics.snake.powerUpLifetime;
        
        const spawnPowerUp = () => {
            if (this.isGameOver) return;
            
            let newPowerUp;
            do {
                newPowerUp = {
                    x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)) * this.gridSize,
                    y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)) * this.gridSize,
                    type: this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)]
                };
            } while (
                this.snake.some(segment => segment.x === newPowerUp.x && segment.y === newPowerUp.y) ||
                (this.food && this.food.x === newPowerUp.x && this.food.y === newPowerUp.y)
            );
            this.powerUp = newPowerUp;
            
            // Remove after lifetime
            this.setTimeoutTracked(() => {
                if (this.powerUp === newPowerUp) {
                    this.powerUp = null;
                }
            }, lifetime);
            
            // Schedule next
            this.setTimeoutTracked(spawnPowerUp, Math.random() * spawnDelay + spawnDelay);
        };
        
        this.setTimeoutTracked(spawnPowerUp, spawnDelay);
    }

    applyPowerUp() {
        const duration = GameConfig.mechanics.snake.powerUpDuration;
        
        switch (this.powerUp.type) {
            case 'speed':
                const oldSpeed1 = this.speed;
                this.speed = Math.max(50, this.speed - 30);
                this.setTimeoutTracked(() => {
                    this.speed = oldSpeed1;
                }, duration);
                this.updateScore(15);
                break;
            case 'points':
                this.updateScore(30);
                break;
            case 'slow':
                const oldSpeed2 = this.speed;
                this.speed = Math.min(300, this.speed + 30);
                this.setTimeoutTracked(() => {
                    this.speed = oldSpeed2;
                }, duration);
                this.updateScore(20);
                break;
        }
        
        this.powerUp = null;
    }

    restart() {
        // Reset game state
        this.score = 0;
        this.foodEaten = 0;
        this.powerUpsCollected = 0;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.powerUp = null;
        this.isGameOver = false;
        this.isPaused = false;
        
        // Reset achievement manager
        this.achievementManager.reset();
        
        // Re-setup game
        this.setupGame();
        
        // Restart
        this.start();
    }

    returnToMenu() {
        // Dispatch custom event to return to menu
        window.dispatchEvent(new CustomEvent('returnToMenu'));
    }

    checkAchievements() {
        this.achievementManager.check('score', this.score);
    }
}
