// Import game modules
async function loadGameModule(gameType) {
    console.log(`Loading ${gameType} module...`);
    try {
        // Remove the 'js/' prefix since we're already in the js directory
        const module = await import(`./${gameType}/${gameType}.js`);
        console.log(`${gameType} module loaded successfully`);
        return module.default;
    } catch (error) {
        console.error(`Failed to load ${gameType} module:`, error);
        throw new Error(`Failed to load ${gameType} game module`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing main.js...');
    
    // Get DOM elements
    const selectionScreen = document.getElementById('selection-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameCanvas = document.getElementById('game-canvas');
    const pauseButton = document.getElementById('pause-button');
    const backButton = document.getElementById('back-button');
    
    let currentGame = null;
    let isPaused = false;

    // Handle pause button
    pauseButton?.addEventListener('click', () => {
        console.log('Pause button clicked');
        if (!currentGame) return;
        
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
        
        if (isPaused) {
            currentGame.pause();
        } else {
            currentGame.resume();
            // Ensure the game loop is running
            requestAnimationFrame(() => currentGame.gameLoop(0));
        }
    });

    // Handle back button
    backButton?.addEventListener('click', () => {
        console.log('Back button clicked');
        if (currentGame) {
            const confirmExit = confirm('Are you sure you want to exit the game?');
            if (confirmExit) {
                if (currentGame.destroy) {
                    currentGame.destroy(); // Clean up any game resources
                }
                returnToMenu();
            }
        }
    });

    // Handle game selection
    async function startGame(gameType) {
        console.log('Starting game:', gameType);
        try {
            // Clean up existing game
            if (currentGame) {
                console.log('Stopping current game');
                if (currentGame.destroy) {
                    currentGame.destroy();
                }
                currentGame = null;
            }

            // Reset pause state
            isPaused = false;
            if (pauseButton) pauseButton.textContent = 'Pause';

            // Switch screens
            console.log('Switching to game screen');
            Utils.screen.setActiveScreen('game-screen');

            // Set up game canvas
            console.log('Setting up game canvas');
            gameCanvas.width = gameType === 'tetris' ? 300 : 600;
            gameCanvas.height = 600;

            // Load and initialize game module
            console.log('Loading game module');
            const GameClass = await loadGameModule(gameType);
            console.log('Initializing new game instance');
            currentGame = new GameClass(gameCanvas);

            if (currentGame) {
                console.log('Starting game instance');
                currentGame.start();
            } else {
                throw new Error('Failed to create game instance');
            }
        } catch (error) {
            console.error('Error starting game:', error);
            alert('Failed to start game. Please try again.');
            returnToMenu();
        }
    }

    // Handle back button and menu return
    function returnToMenu() {
        console.log('Returning to menu');
        if (currentGame) {
            if (currentGame.destroy) {
                currentGame.destroy();
            }
            currentGame = null;
        }
        
        // Reset pause state
        isPaused = false;
        if (pauseButton) pauseButton.textContent = 'Pause';
        
        // Reset score
        Utils.score.resetScore();
        
        // Switch to selection screen
        Utils.screen.setActiveScreen('selection-screen');
    }

    // Initialize preview canvases
    function initPreviews() {
        console.log('Initializing preview canvases...');
        
        const snakePreview = document.getElementById('snake-preview');
        console.log('Snake preview found:', !!snakePreview);
        
        const tetrisPreview = document.getElementById('tetris-preview');
        console.log('Tetris preview found:', !!tetrisPreview);
        
        if (snakePreview) {
            console.log('Setting up snake preview');
            const snakePreviewCtx = snakePreview.getContext('2d');
            snakePreviewCtx.fillStyle = '#4a90e2';
            snakePreviewCtx.fillRect(10, 10, 30, 10);
            snakePreviewCtx.fillRect(20, 10, 10, 30);
        } else {
            console.warn('Snake preview canvas not found');
        }

        if (tetrisPreview) {
            console.log('Setting up tetris preview');
            const tetrisPreviewCtx = tetrisPreview.getContext('2d');
            tetrisPreviewCtx.fillStyle = '#50e3c2';
            // Draw a simple tetromino preview
            const blockSize = 10;
            [[0,0], [1,0], [2,0], [2,1]].forEach(([x, y]) => {
                tetrisPreviewCtx.fillRect(x * blockSize + 10, y * blockSize + 10, blockSize - 1, blockSize - 1);
            });
        } else {
            console.warn('Tetris preview canvas not found');
        }
    }

    // Set up event listeners
    console.log('Setting up event listeners');
    document.querySelectorAll('.play-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const gameType = e.target.dataset.game;
            console.log('Play button clicked:', gameType);
            startGame(gameType);
        });
    });

    // Initialize mobile controls if needed
    function initMobileControls() {
        console.log('Initializing mobile controls...');
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            if (Utils.input.isMobile()) {
                console.log('Mobile device detected, showing controls');
                mobileControls.classList.remove('hidden');
            } else {
                console.log('Desktop device detected, hiding controls');
                mobileControls.classList.add('hidden');
            }
        } else {
            console.warn('Mobile controls container not found');
        }
    }

    // Handle window resize
    function handleResize() {
        console.log('Window resized, updating mobile controls');
        initMobileControls();
    }

    // Initialize everything
    console.log('Starting initialization...');
    initPreviews();
    initMobileControls();
    window.addEventListener('resize', handleResize);

    // Log initial screen state
    console.log('Initial screen states:', {
        selectionScreen: selectionScreen?.classList.contains('hidden'),
        gameScreen: gameScreen?.classList.contains('hidden')
    });

    // Handle keyboard controls
    document.addEventListener('keydown', (e) => {
        if (currentGame && typeof currentGame.handleKeyPress === 'function') {
            currentGame.handleKeyPress(e);
        }
    });
}); 