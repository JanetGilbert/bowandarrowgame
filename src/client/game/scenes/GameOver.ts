import { Scene } from 'phaser';
import * as Phaser from 'phaser';

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

    // Fetch and display high scores
    try {
      const response = await fetch('/api/fetch-highscores');
      const data = await response.json();
      
      if (data.type === 'high-scores') {
        const startY = this.cameras.main.centerY;
        
        this.add.bitmapText(this.cameras.main.centerX, startY - 60, 
                          'moghul_outline', 'Top Scores', 28).setOrigin(0.5);
        
        data.scores.forEach((entry: { name: string; score: number }, index: number) => {
          const yPos = startY -20 + (index * 30);
          this.add.bitmapText(this.cameras.main.centerX, yPos, 
                            'moghul_outline', `${index + 1}. ${entry.name}: ${entry.score}`, 24).setOrigin(0.5);
        });
      }
    } catch (error) {
      console.error('Failed to fetch high scores:', error);
    }
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

  
}
