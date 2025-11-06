export default class Snake {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = Utils.canvas.setupCanvas(this.canvas, 600, 600);
        this.gridSize = 20;
        this.snake = [];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.food = null;
        this.powerUp = null;
        this.speed = 150; // Base speed in milliseconds
        this.lastUpdate = 0;
        this.isPaused = false;
        this.isGameOver = false;
        this.colors = {
            background: '#1a1a1a',
            snake: '#50e3c2',
            snakeHead: '#4a90e2',
            food: '#f5a623',
            powerUp: '#ff4081',
            grid: '#2a2a2a'
        };
        this.powerUpTypes = ['speed', 'points', 'slow'];
        this.setupGame();
    }

    setupGame() {
        // Initialize snake in the middle of the canvas
        const startX = Math.floor(this.canvas.width / (2 * this.gridSize)) * this.gridSize;
        const startY = Math.floor(this.canvas.height / (2 * this.gridSize)) * this.gridSize;
        this.snake = [
            { x: startX, y: startY },
            { x: startX - this.gridSize, y: startY },
            { x: startX - this.gridSize * 2, y: startY }
        ];

        // Bind the event handler to preserve the reference
        this.boundHandleKeyPress = this.handleKeyPress.bind(this);
        
        // Set up controls
        Utils.input.setupKeyboardControls(this.boundHandleKeyPress);
        if ('ontouchstart' in window) {
            Utils.input.setupTouchControls(this.canvas, this.handleDirection.bind(this));
        }

        this.spawnFood();
        this.schedulePowerUp();
    }

    start() {
        this.isGameOver = false;
        this.isPaused = false;
        this.lastUpdate = 0;
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
        this.lastUpdate = 0; // Reset update timer
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

        const direction = Utils.input.getKeyDirection(e.key);
        if (direction) {
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

    gameLoop(deltaTime) {
        if (this.isPaused || this.isGameOver) {
            if (this.isPaused) {
                Utils.canvas.drawPauseOverlay(this.ctx, this.canvas.width, this.canvas.height);
            }
            return;
        }

        this.lastUpdate += deltaTime;
        if (this.lastUpdate >= this.speed) {
            this.update();
            this.lastUpdate = 0;
        }
        this.draw();
    }

    update() {
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };

        // Update head position based on direction
        switch (this.direction) {
            case 'up': head.y -= this.gridSize; break;
            case 'down': head.y += this.gridSize; break;
            case 'left': head.x -= this.gridSize; break;
            case 'right': head.x += this.gridSize; break;
        }

        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check if food is eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            Utils.score.updateScore(10);
            this.spawnFood();
        } else {
            this.snake.pop();
        }

        // Check for power-up collision
        if (this.powerUp && head.x === this.powerUp.x && head.y === this.powerUp.y) {
            this.applyPowerUp();
        }
    }

    draw() {
        Utils.canvas.clearCanvas(this.ctx, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? this.colors.snakeHead : this.colors.snake;
            this.ctx.fillRect(segment.x, segment.y, this.gridSize - 1, this.gridSize - 1);
        });

        // Draw food
        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x + this.gridSize / 2,
            this.food.y + this.gridSize / 2,
            this.gridSize / 2 - 1,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        // Draw power-up if active
        if (this.powerUp) {
            this.ctx.fillStyle = this.colors.powerUp;
            this.ctx.beginPath();
            this.ctx.arc(
                this.powerUp.x + this.gridSize / 2,
                this.powerUp.y + this.gridSize / 2,
                this.gridSize / 2 - 1,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        }
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

            // Remove power-up after 5 seconds if not collected
            setTimeout(() => {
                if (this.powerUp === newPowerUp) {
                    this.powerUp = null;
                }
            }, 5000);

            // Schedule next power-up
            setTimeout(spawnPowerUp, Math.random() * 10000 + 10000);
        };

        // Initial power-up spawn
        setTimeout(spawnPowerUp, 10000);
    }

    applyPowerUp() {
        switch (this.powerUp.type) {
            case 'speed':
                this.speed = Math.max(50, this.speed - 20);
                setTimeout(() => this.speed += 20, 5000);
                Utils.score.updateScore(15);
                break;
            case 'points':
                Utils.score.updateScore(30);
                break;
            case 'slow':
                this.speed = Math.min(300, this.speed + 20);
                setTimeout(() => this.speed -= 20, 5000);
                Utils.score.updateScore(20);
                break;
        }
        
        this.powerUp = null;
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