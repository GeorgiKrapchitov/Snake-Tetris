# 🎮 Classic Games - Quick Start Guide

## 🚀 Getting Started

### 1. Start the Server
```bash
cd /app
node server.js
```

The server will start on **http://localhost:3000**

### 2. Open in Browser
Navigate to http://localhost:3000 in your web browser.

---

## 🎯 Features Overview

### Main Menu
- **🐍 Snake** - Classic snake game with power-ups
- **🧱 Tetris** - Block puzzle game
- **🔊** - Toggle sound on/off
- **⚙️** - Open settings (difficulty, volume, reset data)
- **❓** - View game instructions
- **🏆** - View achievements

### In-Game Controls

#### Snake
- **Arrow Keys** or **WASD** - Move
- **Space** - Pause/Resume
- **R** - Restart (when game over)
- **ESC** - Return to menu (when game over)

#### Tetris
- **Left/Right Arrows** or **A/D** - Move piece
- **Up Arrow** or **W** - Rotate piece
- **Down Arrow** or **S** - Soft drop
- **Space** - Pause/Resume
- **R** - Restart (when game over)
- **ESC** - Return to menu (when game over)

### Mobile
- **Swipe** - Move/rotate pieces
- **Tap** - Rotate (Tetris)

---

## ⭐ Key Improvements

### What's New?
✅ **Difficulty Levels** - Easy, Normal, Hard  
✅ **Achievement System** - 12 achievements to unlock  
✅ **Sound Effects** - Audio feedback for actions  
✅ **Settings Menu** - Customize your experience  
✅ **High Scores** - Separate for each game  
✅ **Better UI** - Modern, responsive design  
✅ **No Memory Leaks** - Proper cleanup  
✅ **Mobile Support** - Touch controls  

---

## 📂 File Structure

```
/app/
├── index.html              # Main HTML (refactored)
├── server.js               # Express server
├── js/
│   ├── config.js           # Game configuration
│   ├── storage.js          # localStorage manager
│   ├── audioManager.js     # Sound system
│   ├── baseGame.js         # Base game class
│   ├── achievementManager.js # Achievement system
│   ├── mainRefactored.js   # Main app controller
│   ├── snake/
│   │   └── snakeRefactored.js # Refactored Snake
│   └── tetris/
│       └── tetrisRefactored.js # Refactored Tetris
└── styles/
    └── mainRefactored.css  # Complete redesign
```

---

## 🎨 Customization

### Change Colors
Edit `/app/js/config.js`:
```javascript
colors: {
    snake: '#50e3c2',      // Change snake color
    food: '#f5a623',       // Change food color
    // ... etc
}
```

### Adjust Difficulty
Edit `/app/js/config.js`:
```javascript
difficulty: {
    easy: {
        snake: { speed: 200 },    // Slower
        tetris: { dropInterval: 1200 }
    }
}
```

---

## 🐛 Troubleshooting

### Game Won't Load
1. Check browser console (F12) for errors
2. Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
3. Clear browser cache and reload

### No Sound
1. Click the sound icon (🔊) to unmute
2. Check browser sound permissions
3. Ensure browser isn't muted

### Settings Not Saving
1. Check if localStorage is enabled in browser
2. Try in a different browser
3. Reset all data in Settings menu

---

## 📚 More Information

For detailed documentation, see:
- **README_IMPROVEMENTS.md** - Complete list of improvements
- **README.md** - Original project information

---

## 🎉 Enjoy!

Have fun playing Classic Games! Try to unlock all achievements and beat your high scores! 🏆

**Pro Tips:**
- Start with Easy difficulty to learn the games
- Watch for power-ups in Snake (pink circles)
- Use the ghost piece in Tetris to plan your moves
- Check the achievements menu to see what to aim for

---

*Updated: 2025 - Complete Overhaul Version*
