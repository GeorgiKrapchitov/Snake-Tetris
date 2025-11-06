// Game Configuration
export const GameConfig = {
    // Difficulty settings
    difficulty: {
        easy: {
            snake: { speed: 200, powerUpChance: 0.3 },
            tetris: { dropInterval: 1200, lineScore: 100 }
        },
        normal: {
            snake: { speed: 150, powerUpChance: 0.2 },
            tetris: { dropInterval: 1000, lineScore: 100 }
        },
        hard: {
            snake: { speed: 100, powerUpChance: 0.1 },
            tetris: { dropInterval: 700, lineScore: 150 }
        }
    },

    // Visual settings
    visual: {
        gridSize: 20,
        blockSize: 30,
        canvasWidth: {
            snake: 600,
            tetris: 300
        },
        canvasHeight: 600,
        colors: {
            background: '#1a1a1a',
            grid: '#2a2a2a',
            snake: '#50e3c2',
            snakeHead: '#4a90e2',
            food: '#f5a623',
            powerUp: '#ff4081',
            tetrisPieces: [
                '#4a90e2', // I piece
                '#50e3c2', // J piece
                '#f5a623', // L piece
                '#ff4081', // O piece
                '#9013fe', // S piece
                '#bd10e0', // T piece
                '#7ed321'  // Z piece
            ]
        }
    },

    // Audio settings
    audio: {
        enabled: true,
        volume: {
            music: 0.3,
            sfx: 0.5
        }
    },

    // Game mechanics
    mechanics: {
        snake: {
            initialLength: 3,
            powerUpDuration: 5000,
            powerUpSpawnDelay: 10000,
            powerUpLifetime: 5000,
            scorePerFood: 10,
            scorePerPowerUp: 20
        },
        tetris: {
            boardWidth: 10,
            boardHeight: 20,
            scorePerLine: 100,
            speedIncreasePerLine: 10,
            minDropInterval: 100
        }
    },

    // Achievements
    achievements: {
        snake: [
            { id: 'first_food', name: 'First Bite', description: 'Eat your first food', requirement: 1 },
            { id: 'score_100', name: 'Getting Started', description: 'Score 100 points', requirement: 100 },
            { id: 'score_500', name: 'Snake Master', description: 'Score 500 points', requirement: 500 },
            { id: 'score_1000', name: 'Legend', description: 'Score 1000 points', requirement: 1000 },
            { id: 'length_20', name: 'Long Snake', description: 'Grow to 20 segments', requirement: 20 },
            { id: 'powerup_10', name: 'Power Hungry', description: 'Collect 10 power-ups', requirement: 10 }
        ],
        tetris: [
            { id: 'first_line', name: 'Line Cleared', description: 'Clear your first line', requirement: 1 },
            { id: 'score_500', name: 'Getting Started', description: 'Score 500 points', requirement: 500 },
            { id: 'score_2000', name: 'Tetris Master', description: 'Score 2000 points', requirement: 2000 },
            { id: 'score_5000', name: 'Legend', description: 'Score 5000 points', requirement: 5000 },
            { id: 'lines_10', name: '10 Lines', description: 'Clear 10 lines', requirement: 10 },
            { id: 'lines_50', name: '50 Lines', description: 'Clear 50 lines', requirement: 50 }
        ]
    }
};

export default GameConfig;