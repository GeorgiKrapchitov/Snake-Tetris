// Achievement Manager
import { GameConfig } from './config.js';
import StorageManager from './storage.js';
import AudioManager from './audioManager.js';

export class AchievementManager {
    constructor(gameType) {
        this.gameType = gameType;
        this.achievements = GameConfig.achievements[gameType] || [];
        this.unlockedAchievements = StorageManager.getAchievements(gameType);
        this.justUnlocked = [];
    }

    check(stat, value) {
        this.achievements.forEach(achievement => {
            // Check if already unlocked
            if (this.unlockedAchievements.includes(achievement.id)) return;
            
            // Check if requirement met
            const requirementMet = this.checkRequirement(achievement, stat, value);
            
            if (requirementMet) {
                this.unlock(achievement);
            }
        });
        
        return this.justUnlocked;
    }

    checkRequirement(achievement, stat, value) {
        // Map achievement IDs to stats
        const achievementType = achievement.id.split('_')[0];
        
        switch (achievementType) {
            case 'score':
                return stat === 'score' && value >= achievement.requirement;
            case 'first':
                return stat === achievement.id.split('_')[1] && value >= 1;
            case 'length':
                return stat === 'length' && value >= achievement.requirement;
            case 'powerup':
                return stat === 'powerup' && value >= achievement.requirement;
            case 'lines':
                return stat === 'lines' && value >= achievement.requirement;
            default:
                return false;
        }
    }

    unlock(achievement) {
        const added = StorageManager.addAchievement(this.gameType, achievement.id);
        
        if (added) {
            this.unlockedAchievements.push(achievement.id);
            this.justUnlocked.push(achievement);
            AudioManager.play('achievement');
            this.showNotification(achievement);
        }
    }

    showNotification(achievement) {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getProgress() {
        return {
            unlocked: this.unlockedAchievements.length,
            total: this.achievements.length,
            percentage: Math.round((this.unlockedAchievements.length / this.achievements.length) * 100)
        };
    }

    reset() {
        this.justUnlocked = [];
    }
}

export default AchievementManager;