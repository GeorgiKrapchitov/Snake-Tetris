// Main application controller - Refactored
import { GameConfig } from './config.js';
import StorageManager from './storage.js';
import AudioManager from './audioManager.js';

class GameApp {
    constructor() {
        this.currentGame = null;
        this.settings = StorageManager.getSettings();
        this.init();
    }

    async init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        console.log('Initializing Game App...');
        
        // Initialize audio
        AudioManager.init();
        AudioManager.setEnabled(this.settings.soundEnabled);
        AudioManager.setMusicVolume(this.settings.musicVolume);
        AudioManager.setSFXVolume(this.settings.sfxVolume);
        
        // Setup UI
        this.setupUI();
        this.setupEventListeners();
        this.updateHighScores();
        
        // Show instructions on first visit
        if (!localStorage.getItem('classicGames_visited')) {
            this.showInstructions();
            localStorage.setItem('classicGames_visited', 'true');
        }
    }

    setupUI() {
        // Update difficulty display
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            if (btn.dataset.difficulty === this.settings.difficulty) {
                btn.classList.add('active');
            }
        });
        
        // Update sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.textContent = this.settings.soundEnabled ? '🔊' : '🔇';
        }
    }

    setupEventListeners() {
        // Game selection
        document.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const gameType = e.target.dataset.game;
                this.startGame(gameType);
            });
        });
        
        // Back button
        const backButton = document.getElementById('back-button');
        if (backButton) {
            backButton.addEventListener('click', () => this.confirmExit());
        }
        
        // Pause button
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.addEventListener('click', () => this.togglePause());
        }
        
        // Restart button
        const restartButton = document.getElementById('restart-button');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.restartGame());
        }
        
        // Settings button
        const settingsButton = document.getElementById('settings-button');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => this.showSettings());
        }
        
        // Instructions button
        const instructionsButton = document.getElementById('instructions-button');
        if (instructionsButton) {
            instructionsButton.addEventListener('click', () => this.showInstructions());
        }
        
        // Achievements button
        const achievementsButton = document.getElementById('achievements-button');
        if (achievementsButton) {
            achievementsButton.addEventListener('click', () => this.showAchievements());
        }
        
        // Sound toggle
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => this.toggleSound());
        }
        
        // Listen for return to menu event
        window.addEventListener('returnToMenu', () => this.returnToMenu());
    }

    async startGame(gameType) {
        console.log('Starting game:', gameType);
        
        try {
            // Clean up existing game
            if (this.currentGame) {
                this.currentGame.destroy();
                this.currentGame = null;
            }
            
            // Switch to game screen
            this.showScreen('game-screen');
            
            // Get canvas
            const canvas = document.getElementById('game-canvas');
            
            // Load game module
            let GameClass;
            if (gameType === 'snake') {
                const module = await import('./snake/snakeRefactored.js');
                GameClass = module.default;
            } else if (gameType === 'tetris') {
                const module = await import('./tetris/tetrisRefactored.js');
                GameClass = module.default;
            }
            
            // Create game instance
            this.currentGame = new GameClass(canvas);
            this.currentGame.start();
            
            // Update pause button
            const pauseButton = document.getElementById('pause-button');
            if (pauseButton) {
                pauseButton.textContent = 'Pause';
            }
            
        } catch (error) {
            console.error('Error starting game:', error);
            alert('Failed to start game. Please try again.');
            this.returnToMenu();
        }
    }

    togglePause() {
        if (!this.currentGame) return;
        
        const isPaused = this.currentGame.togglePause();
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
        }
    }

    restartGame() {
        if (!this.currentGame) return;
        
        const confirmRestart = confirm('Are you sure you want to restart?');
        if (confirmRestart && this.currentGame.restart) {
            this.currentGame.restart();
        }
    }

    confirmExit() {
        if (!this.currentGame) {
            this.returnToMenu();
            return;
        }
        
        const confirmExit = confirm('Are you sure you want to exit? Your progress will be lost.');
        if (confirmExit) {
            this.returnToMenu();
        }
    }

    returnToMenu() {
        console.log('Returning to menu');
        
        if (this.currentGame) {
            this.currentGame.destroy();
            this.currentGame = null;
        }
        
        // Reset score display
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = '0';
        }
        
        // Update high scores
        this.updateHighScores();
        
        // Show selection screen
        this.showScreen('selection-screen');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
        }
    }

    updateHighScores() {
        const snakeHighScore = StorageManager.getHighScore('snake');
        const tetrisHighScore = StorageManager.getHighScore('tetris');
        
        const snakeHighScoreEl = document.getElementById('snake-high-score');
        const tetrisHighScoreEl = document.getElementById('tetris-high-score');
        
        if (snakeHighScoreEl) {
            snakeHighScoreEl.textContent = snakeHighScore;
        }
        if (tetrisHighScoreEl) {
            tetrisHighScoreEl.textContent = tetrisHighScore;
        }
    }

    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        AudioManager.setEnabled(this.settings.soundEnabled);
        StorageManager.setSettings(this.settings);
        
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.textContent = this.settings.soundEnabled ? '🔊' : '🔇';
        }
    }

    showSettings() {
        // Create settings modal
        const modal = this.createModal('Settings', `
            <div class=\"settings-content\">
                <div class=\"setting-group\">
                    <label>Difficulty</label>
                    <div class=\"difficulty-buttons\">
                        <button class=\"difficulty-btn ${this.settings.difficulty === 'easy' ? 'active' : ''}\" data-difficulty=\"easy\">Easy</button>
                        <button class=\"difficulty-btn ${this.settings.difficulty === 'normal' ? 'active' : ''}\" data-difficulty=\"normal\">Normal</button>
                        <button class=\"difficulty-btn ${this.settings.difficulty === 'hard' ? 'active' : ''}\" data-difficulty=\"hard\">Hard</button>
                    </div>
                </div>
                
                <div class=\"setting-group\">
                    <label>Sound Effects</label>
                    <input type=\"checkbox\" id=\"sound-enabled\" ${this.settings.soundEnabled ? 'checked' : ''}>
                </div>
                
                <div class=\"setting-group\">
                    <label>SFX Volume</label>
                    <input type=\"range\" id=\"sfx-volume\" min=\"0\" max=\"100\" value=\"${this.settings.sfxVolume * 100}\">
                </div>
                
                <div class=\"setting-group\">
                    <button id=\"reset-data\" class=\"danger-btn\">Reset All Data</button>
                </div>
            </div>
        `);
        
        // Add event listeners
        modal.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.settings.difficulty = e.target.dataset.difficulty;
                StorageManager.setSettings(this.settings);
                modal.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        const soundEnabled = modal.querySelector('#sound-enabled');
        if (soundEnabled) {
            soundEnabled.addEventListener('change', (e) => {
                this.settings.soundEnabled = e.target.checked;
                AudioManager.setEnabled(this.settings.soundEnabled);
                StorageManager.setSettings(this.settings);
                this.setupUI();
            });
        }
        
        const sfxVolume = modal.querySelector('#sfx-volume');
        if (sfxVolume) {
            sfxVolume.addEventListener('input', (e) => {
                this.settings.sfxVolume = e.target.value / 100;
                AudioManager.setSFXVolume(this.settings.sfxVolume);
                StorageManager.setSettings(this.settings);
            });
        }
        
        const resetBtn = modal.querySelector('#reset-data');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
                    StorageManager.clearAll();
                    location.reload();
                }
            });
        }
    }

    showInstructions() {
        const modal = this.createModal('How to Play', `
            <div class=\"instructions-content\">
                <div class=\"game-instructions\">
                    <h3>🐍 Snake</h3>
                    <p><strong>Goal:</strong> Eat food to grow longer without hitting walls or yourself</p>
                    <p><strong>Controls:</strong></p>
                    <ul>
                        <li>Arrow Keys or WASD to move</li>
                        <li>Space to pause</li>
                        <li>R to restart (when game over)</li>
                        <li>ESC to return to menu</li>
                    </ul>
                    <p><strong>Power-ups:</strong></p>
                    <ul>
                        <li>⚡ Speed Boost</li>
                        <li>🎯 Bonus Points</li>
                        <li>🐌 Slow Down</li>
                    </ul>
                </div>
                
                <div class=\"game-instructions\">
                    <h3>🧱 Tetris</h3>
                    <p><strong>Goal:</strong> Complete horizontal lines to score points</p>
                    <p><strong>Controls:</strong></p>
                    <ul>
                        <li>Left/Right arrows or A/D to move</li>
                        <li>Up arrow or W to rotate</li>
                        <li>Down arrow or S for soft drop</li>
                        <li>Space to pause</li>
                        <li>R to restart (when game over)</li>
                        <li>ESC to return to menu</li>
                    </ul>
                    <p><strong>Scoring:</strong></p>
                    <ul>
                        <li>1 line: 100 pts</li>
                        <li>2 lines: 250 pts</li>
                        <li>3 lines: 400 pts</li>
                        <li>4 lines: 800 pts</li>
                    </ul>
                </div>
                
                <div class=\"mobile-note\">
                    <p><strong>📱 Mobile:</strong> Swipe to move/rotate pieces</p>
                </div>
            </div>
        `);
    }

    showAchievements() {
        const snakeAchievements = GameConfig.achievements.snake;
        const tetrisAchievements = GameConfig.achievements.tetris;
        const unlockedSnake = StorageManager.getAchievements('snake');
        const unlockedTetris = StorageManager.getAchievements('tetris');
        
        const renderAchievements = (achievements, unlocked, gameTitle) => {
            return `
                <div class=\"achievement-section\">
                    <h3>${gameTitle}</h3>
                    <div class=\"achievements-grid\">
                        ${achievements.map(ach => `
                            <div class=\"achievement-item ${unlocked.includes(ach.id) ? 'unlocked' : 'locked'}\">
                                <div class=\"achievement-icon\">${unlocked.includes(ach.id) ? '🏆' : '🔒'}</div>
                                <div class=\"achievement-info\">
                                    <div class=\"achievement-name\">${ach.name}</div>
                                    <div class=\"achievement-description\">${ach.description}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        };
        
        const modal = this.createModal('Achievements', `
            <div class=\"achievements-content\">
                ${renderAchievements(snakeAchievements, unlockedSnake, '🐍 Snake')}
                ${renderAchievements(tetrisAchievements, unlockedTetris, '🧱 Tetris')}
            </div>
        `);
    }

    createModal(title, content) {
        // Remove existing modal if any
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class=\"modal-content\">
                <div class=\"modal-header\">
                    <h2>${title}</h2>
                    <button class=\"modal-close\">&times;</button>
                </div>
                <div class=\"modal-body\">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add close handler
        const closeBtn = modal.querySelector('.modal-close');
        const closeModal = () => modal.remove();
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        // Show modal
        setTimeout(() => modal.classList.add('show'), 10);
        
        return modal;
    }
}

// Initialize app when DOM is ready
const app = new GameApp();
