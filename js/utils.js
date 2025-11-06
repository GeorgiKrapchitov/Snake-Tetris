// Utility functions for game operations
const Utils = {
    // Screen management
    screen: {
        setActiveScreen: function(screenId) {
            console.log('Setting active screen:', screenId);
            const screens = document.querySelectorAll('#selection-screen, #game-screen');
            console.log('Found screens:', screens.length);
            
            screens.forEach(screen => {
                if (screen.id === screenId) {
                    console.log('Showing screen:', screen.id);
                    screen.classList.remove('hidden');
                } else {
                    console.log('Hiding screen:', screen.id);
                    screen.classList.add('hidden');
                }
            });
        },
        
        getCurrentScreen: function() {
            const visibleScreen = document.querySelector('#selection-screen:not(.hidden), #game-screen:not(.hidden)');
            console.log('Current visible screen:', visibleScreen?.id);
            return visibleScreen?.id;
        }
    },

    // Canvas utilities
    canvas: {
        setupCanvas(canvas, width, height) {
            canvas.width = width;
            canvas.height = height;
            return canvas.getContext('2d');
        },

        clearCanvas(ctx, width, height) {
            ctx.clearRect(0, 0, width, height);
        },

        drawRect(ctx, x, y, width, height, color) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        },

        drawCircle(ctx, x, y, radius, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        },

        drawText(ctx, text, x, y, options = {}) {
            const {
                font = '20px Arial',
                color = 'white',
                align = 'center',
                baseline = 'middle'
            } = options;

            ctx.font = font;
            ctx.fillStyle = color;
            ctx.textAlign = align;
            ctx.textBaseline = baseline;
            ctx.fillText(text, x, y);
        },

        drawPauseOverlay(ctx, width, height) {
            // Semi-transparent background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, width, height);
            
            // Pause text
            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('PAUSED', width / 2, height / 2);
            
            // Instructions
            ctx.font = '24px Arial';
            ctx.fillText('Press SPACE to resume', width / 2, height / 2 + 40);
        }
    },

    // Input handling
    input: {
        touchStartX: null,
        touchStartY: null,
        minSwipeDistance: 30,

        setupKeyboardControls(keydownHandler) {
            document.addEventListener('keydown', keydownHandler);
        },

        setupTouchControls(element, swipeHandler) {
            element.addEventListener('touchstart', (e) => {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            });

            element.addEventListener('touchend', (e) => {
                if (!this.touchStartX || !this.touchStartY) return;

                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;

                const deltaX = touchEndX - this.touchStartX;
                const deltaY = touchEndY - this.touchStartY;

                if (Math.abs(deltaX) > this.minSwipeDistance || Math.abs(deltaY) > this.minSwipeDistance) {
                    const direction = Math.abs(deltaX) > Math.abs(deltaY)
                        ? (deltaX > 0 ? 'right' : 'left')
                        : (deltaY > 0 ? 'down' : 'up');
                    swipeHandler(direction);
                }

                this.touchStartX = null;
                this.touchStartY = null;
            });
        },

        isMobile: function() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        getKeyDirection(key) {
            const keyMap = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right',
                'w': 'up',
                's': 'down',
                'a': 'left',
                'd': 'right'
            };
            return keyMap[key] || null;
        }
    },

    // Animation frame management
    animation: {
        requestFrame: null,
        
        startGameLoop(callback) {
            let lastTime = 0;
            const animate = (currentTime) => {
                if (!lastTime) lastTime = currentTime;
                const deltaTime = currentTime - lastTime;
                callback(deltaTime);
                lastTime = currentTime;
                this.requestFrame = requestAnimationFrame(animate);
            };
            this.requestFrame = requestAnimationFrame(animate);
        },

        stopGameLoop() {
            if (this.requestFrame) {
                cancelAnimationFrame(this.requestFrame);
                this.requestFrame = null;
            }
        }
    },

    // Score management
    score: {
        currentScore: 0,
        highScore: localStorage.getItem('highScore') || 0,

        updateScore(points) {
            this.currentScore += points;
            document.getElementById('score').textContent = this.currentScore;

            if (this.currentScore > this.highScore) {
                this.highScore = this.currentScore;
                localStorage.setItem('highScore', this.highScore);
            }
        },

        resetScore() {
            this.currentScore = 0;
            document.getElementById('score').textContent = '0';
        }
    }
};

// Make Utils globally available
window.Utils = Utils;

// Log when Utils is loaded
console.log('Utils.js loaded successfully'); 