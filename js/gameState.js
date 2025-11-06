// Game state management
class GameState {
    constructor() {
        console.log('Initializing GameState...');
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.level = 1;
        this.isPaused = false;
        this.isGameOver = false;
        this.updateCallback = null;
        this.currentGame = null;
        this.gameInstance = null;
        this.difficulty = 'normal';
        this.gameCanvas = document.getElementById('game-canvas');
        
        // Ensure DOM is loaded before setting up event listeners
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Game selection buttons
        const playButtons = document.querySelectorAll('.play-button');
        console.log('Found play buttons:', playButtons.length);
        
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                console.log('Play button clicked:', e.target.dataset.game);
                this.startGame(e.target.dataset.game);
            });
        });

        // Pause button
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                console.log('Pause button clicked');
                this.togglePause();
            });
        }

        // Back button
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                console.log('Back button clicked');
                this.endGame();
                Utils.screen.setActiveScreen('selection-screen');
            });
        }

        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => {
                console.log('Sound toggle clicked');
                Utils.audio.toggleMute();
            });
        }
    }

    async startGame(gameType) {
        console.log('Starting game:', gameType);
        try {
            // Clean up existing game instance
            if (this.gameInstance) {
                console.log('Cleaning up existing game instance');
                this.gameInstance.stop();
                this.gameInstance = null;
            }

            // Reset game state
            this.reset();
            
            // Switch to game screen first
            console.log('Switching to game screen');
            Utils.screen.setActiveScreen('game-screen');
            
            // Set up game canvas
            if (this.gameCanvas) {
                console.log('Setting up game canvas');
                this.gameCanvas.width = 400;
                this.gameCanvas.height = 600;
                const ctx = this.gameCanvas.getContext('2d');
                if (!ctx) {
                    throw new Error('Could not get canvas context');
                }
            } else {
                throw new Error('Game canvas not found');
            }

            // Start background music
            console.log('Starting background music');
            Utils.audio.backgroundMusic?.play().catch(e => console.warn('Audio autoplay blocked:', e));

            // Initialize game instance
            console.log('Loading game module:', gameType);
            let gameModule;
            try {
                if (gameType === 'snake') {
                    gameModule = await import('./snake/snake.js');
                } else if (gameType === 'tetris') {
                    gameModule = await import('./tetris/tetris.js');
                } else {
                    throw new Error('Invalid game type');
                }
            } catch (error) {
                console.error('Failed to load game module:', error);
                throw new Error(`Failed to load ${gameType} game module`);
            }

            console.log('Creating game instance');
            this.gameInstance = new gameModule.default(this.gameCanvas);
            this.currentGame = gameType;

            // Start the game
            if (this.gameInstance && typeof this.gameInstance.start === 'function') {
                console.log('Starting game instance');
                this.gameInstance.start();
                
                // Setup mobile controls if needed
                if (Utils.input.isMobile()) {
                    console.log('Setting up mobile controls');
                    this.setupMobileControls();
                }
            } else {
                throw new Error('Invalid game instance');
            }
        } catch (error) {
            console.error('Error starting game:', error);
            this.handleGameError(error);
        }
    }

    handleGameError(error) {
        console.error('Handling game error:', error);
        // Clean up on error
        this.endGame();
        
        // Show user-friendly error message
        const errorMessage = error.message || 'Failed to start game. Please try again.';
        alert(errorMessage);
        
        // Reset UI
        Utils.screen.setActiveScreen('selection-screen');
    }

    endGame() {
        console.log('Ending game');
        // Stop the game instance
        if (this.gameInstance && typeof this.gameInstance.stop === 'function') {
            this.gameInstance.stop();
        }

        // Stop background music
        Utils.audio.backgroundMusic?.pause();
        if (Utils.audio.backgroundMusic) {
            Utils.audio.backgroundMusic.currentTime = 0;
        }

        // Reset state
        this.reset();
        this.gameInstance = null;
        this.currentGame = null;

        // Update UI
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.textContent = 'Pause';
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.updateUI();
        return this.isPaused;
    }

    setupMobileControls() {
        const mobileControls = document.querySelector('.mobile-controls');
        mobileControls.classList.remove('hidden');

        // Clear existing controls
        mobileControls.innerHTML = '';

        if (this.currentGame === 'snake') {
            this.setupSnakeMobileControls(mobileControls);
        } else if (this.currentGame === 'tetris') {
            this.setupTetrisMobileControls(mobileControls);
        }
    }

    setupSnakeMobileControls(container) {
        const controls = [
            { direction: 'up', symbol: '↑' },
            { direction: 'left', symbol: '←' },
            { direction: 'down', symbol: '↓' },
            { direction: 'right', symbol: '→' }
        ];

        controls.forEach(control => {
            const button = document.createElement('button');
            button.textContent = control.symbol;
            button.classList.add('mobile-control-btn');
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameInstance) {
                    this.gameInstance.handleDirection(control.direction);
                }
            });
            container.appendChild(button);
        });
    }

    setupTetrisMobileControls(container) {
        const controls = [
            { action: 'rotate', symbol: '↻' },
            { action: 'left', symbol: '←' },
            { action: 'down', symbol: '↓' },
            { action: 'right', symbol: '→' }
        ];

        controls.forEach(control => {
            const button = document.createElement('button');
            button.textContent = control.symbol;
            button.classList.add('mobile-control-btn');
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameInstance) {
                    this.gameInstance.handleControl(control.action);
                }
            });
            container.appendChild(button);
        });
    }

    setUpdateCallback(callback) {
        this.updateCallback = callback;
    }

    updateScore(points) {
        this.score += points;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        this.updateLevel();
        this.updateUI();
    }

    updateLevel() {
        this.level = Math.floor(this.score / 1000) + 1;
        this.updateUI();
    }

    gameOver() {
        this.isGameOver = true;
        this.updateUI();
    }

    reset() {
        this.score = 0;
        this.level = 1;
        this.isPaused = false;
        this.isGameOver = false;
        this.updateUI();
    }

    loadHighScore() {
        const saved = localStorage.getItem('highScore');
        return saved ? parseInt(saved) : 0;
    }

    saveHighScore() {
        localStorage.setItem('highScore', this.highScore.toString());
    }

    updateUI() {
        // Update score display
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score.toString();
        }

        // Update pause button
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.textContent = this.isPaused ? 'Resume' : 'Pause';
        }

        // Notify any listeners of state change
        if (this.updateCallback) {
            this.updateCallback({
                score: this.score,
                level: this.level,
                highScore: this.highScore,
                isPaused: this.isPaused,
                isGameOver: this.isGameOver
            });
        }
    }
}

// Create a global instance
window.gameState = new GameState(); 