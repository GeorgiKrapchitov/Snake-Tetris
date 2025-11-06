console.log('Testing script loading...');

// Test Utils object
console.log('Utils available:', typeof Utils !== 'undefined');

// Test GameState object
console.log('GameState available:', typeof gameState !== 'undefined');

// Test canvas elements
console.log('Game canvas:', document.getElementById('game-canvas'));
console.log('Snake preview canvas:', document.getElementById('snake-preview'));
console.log('Tetris preview canvas:', document.getElementById('tetris-preview')); 