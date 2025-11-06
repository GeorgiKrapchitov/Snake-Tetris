# Classic Games: Snake & Tetris

A modern implementation of two classic games: Snake and Tetris. Built with HTML5 Canvas, CSS3, and JavaScript.

## Features

- Two classic games in one application
- Modern, responsive design
- Smooth animations and controls
- Mobile support with touch controls
- Sound effects and background music
- High score tracking
- Power-ups in Snake game
- Multiple difficulty levels

## Controls

### Snake
- Arrow keys or WASD to control direction
- Mobile: Swipe or use on-screen controls

### Tetris
- Left/Right arrows or A/D to move piece
- Up arrow or W to rotate piece
- Down arrow or S to soft drop
- Space to hard drop
- Mobile: Swipe or use on-screen controls

## Setup

1. Clone the repository
2. Add sound files to the `assets/sounds` directory:
   - `background.mp3` - Background music
   - `food.mp3` - Snake eating food / Tetris piece placement
   - `collision.mp3` - Game over sound
   - `line-clear.mp3` - Tetris line clear sound

## Development

The project is structured as follows:

```
.
├── index.html
├── styles/
│   └── main.css
├── js/
│   ├── main.js
│   ├── utils.js
│   ├── gameState.js
│   ├── snake/
│   │   └── snake.js
│   └── tetris/
│       └── tetris.js
└── assets/
    └── sounds/
        ├── background.mp3
        ├── food.mp3
        ├── collision.mp3
        └── line-clear.mp3
```

## Sound Credits

Please add appropriate sound files to the `assets/sounds` directory. You can find free game sound effects at:
- https://freesound.org/
- https://opengameart.org/
- https://soundbible.com/

## License

MIT License - Feel free to use this code for your own projects. 