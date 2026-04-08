import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import type { HighScoreEntry, UserRankResponse } from '../../../shared/types/api.js';

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image | null = null;
  gameOverText: Phaser.GameObjects.BitmapText | null = null;
  finalScoreText: Phaser.GameObjects.BitmapText | null = null;
  highScoreText: Phaser.GameObjects.BitmapText | null = null;
  mainMenuButton: Phaser.GameObjects.BitmapText | null = null;

  finalScore: number = 0;
  highScore: number = 0;

  constructor() {
    super('GameOver');
  }

  

  init(data: { score?: number, highScore?: number }) {
    // Get score data from the game scene
    this.finalScore = data.score || 0;
    this.highScore = data.highScore || 0;
    this.background = null;
    this.gameOverText = null;
    this.finalScoreText = null;
    this.highScoreText = null;
  }

  async create() {
    // Configure camera
    this.camera = this.cameras.main;

    if (!this.background) {
      this.background = this.add.image(0, 0, 'title_background').setOrigin(0);
    }

    this.gameOverText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 220, 
                                        'coffee_spark', 'Game Over!', 64).setOrigin(0.5);

    this.finalScoreText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 140, 
                                          'moghul_outline', `Final Score: ${this.finalScore}`, 32).setOrigin(0.5);

    // Fetch and display high scores with user rank
    await this.fetchAndDisplayScores();

     // Main Menu button
    this.mainMenuButton = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.height - 80, 'coffee_spark', 'Main Menu', 64).setOrigin(0.5);
    this.mainMenuButton.setInteractive();

    this.mainMenuButton.on('pointerover', () => {
      this.mainMenuButton?.setTint(0xc7bfff);
    });

    this.mainMenuButton.on('pointerout', () => {
      this.mainMenuButton?.clearTint(); 
    });

    this.mainMenuButton.on('pointerdown', () => {
      this.mainMenuButton?.setPosition(this.mainMenuButton.x + 2, this.mainMenuButton.y + 2); // Shadow effect
    });

    this.mainMenuButton.on('pointerup', () => {
      this.mainMenuButton?.setPosition(this.mainMenuButton.x - 2, this.mainMenuButton.y - 2); // Remove shadow
       this.scene.start('MainMenu');
    });         

        // Add half second delay before accepting keyboard input
    this.time.delayedCall(500, () => {

      this.input.keyboard!.once('keydown-SPACE', () => {
         this.scene.start('MainMenu');
      });
    });
  }

  private async fetchAndDisplayScores() {
    const cx = this.cameras.main.centerX;
    let scores: HighScoreEntry[] = [];
    let userRank: UserRankResponse = { type: 'user-rank', rank: null, score: null };

    try {
      const [scoresRes, rankRes] = await Promise.all([
        fetch('/api/fetch-highscores'),
        fetch('/api/user-rank'),
      ]);
      const scoresData = await scoresRes.json();
      scores = scoresData.scores ?? [];
      userRank = await rankRes.json();
    } catch (error) {
      console.error('Failed to fetch high scores:', error);
      return;
    }

    const startY = this.cameras.main.centerY - 60;
    this.add.bitmapText(cx, startY, 'moghul_outline', 'Top Scores', 28).setOrigin(0.5);

    const lineHeight = 30;
    const totalLines = 5;
    const listStartY = startY + 40;

    // Check if the current user is already in the top 5
    const userInTop5 = userRank.rank !== null && userRank.rank <= totalLines;
    const showUserInLast = !userInTop5 && userRank.rank !== null && userRank.score !== null;
    const topSlots = showUserInLast ? totalLines - 1 : totalLines;

    // Display top scores
    for (let i = 0; i < topSlots; i++) {
      const label = i < scores.length
        ? `${i + 1}. ${scores[i]!.name}: ${scores[i]!.score}`
        : `${i + 1}. ----------`;
      this.add.bitmapText(cx, listStartY + i * lineHeight, 'moghul_outline', label, 24).setOrigin(0.5);
    }

    // If user is outside top 5, show their rank in the last row
    if (showUserInLast) {
      this.add.bitmapText(
        cx, listStartY + (totalLines - 1) * lineHeight,
        'moghul_outline',
        `${userRank.rank}. ${userRank.score}  (You)`,
        24
      ).setOrigin(0.5);
    }
  }

  
}
