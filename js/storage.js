// Storage Manager for localStorage operations
export class StorageManager {
    constructor() {
        this.prefix = 'classicGames_';
    }

    // High scores
    getHighScore(gameType) {
        const key = `${this.prefix}highScore_${gameType}`;
        const score = localStorage.getItem(key);
        return score ? parseInt(score, 10) : 0;
    }

    setHighScore(gameType, score) {
        const key = `${this.prefix}highScore_${gameType}`;
        const currentHigh = this.getHighScore(gameType);
        if (score > currentHigh) {
            localStorage.setItem(key, score.toString());
            return true; // New high score
        }
        return false;
    }

    // Settings
    getSettings() {
        const key = `${this.prefix}settings`;
        const settings = localStorage.getItem(key);
        return settings ? JSON.parse(settings) : {
            difficulty: 'normal',
            soundEnabled: true,
            musicVolume: 0.3,
            sfxVolume: 0.5
        };
    }

    setSettings(settings) {
        const key = `${this.prefix}settings`;
        localStorage.setItem(key, JSON.stringify(settings));
    }

    // Achievements
    getAchievements(gameType) {
        const key = `${this.prefix}achievements_${gameType}`;
        const achievements = localStorage.getItem(key);
        return achievements ? JSON.parse(achievements) : [];
    }

    addAchievement(gameType, achievementId) {
        const achievements = this.getAchievements(gameType);
        if (!achievements.includes(achievementId)) {
            achievements.push(achievementId);
            const key = `${this.prefix}achievements_${gameType}`;
            localStorage.setItem(key, JSON.stringify(achievements));
            return true; // New achievement
        }
        return false;
    }

    // Game statistics
    getStats(gameType) {
        const key = `${this.prefix}stats_${gameType}`;
        const stats = localStorage.getItem(key);
        return stats ? JSON.parse(stats) : {
            gamesPlayed: 0,
            totalScore: 0,
            bestGame: 0,
            totalTime: 0
        };
    }

    updateStats(gameType, score, time) {
        const stats = this.getStats(gameType);
        stats.gamesPlayed++;
        stats.totalScore += score;
        stats.bestGame = Math.max(stats.bestGame, score);
        stats.totalTime += time;
        const key = `${this.prefix}stats_${gameType}`;
        localStorage.setItem(key, JSON.stringify(stats));
    }

    // Clear all data
    clearAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }

    // Clear game-specific data
    clearGame(gameType) {
        localStorage.removeItem(`${this.prefix}highScore_${gameType}`);
        localStorage.removeItem(`${this.prefix}achievements_${gameType}`);
        localStorage.removeItem(`${this.prefix}stats_${gameType}`);
    }
}

export default new StorageManager();