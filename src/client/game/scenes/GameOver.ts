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

  create() {
    // Configure camera
    this.camera = this.cameras.main;

    if (!this.background) {
      this.background = this.add.image(0, 0, 'title_background').setOrigin(0);
    }

    this.gameOverText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 200, 
                                        'coffee_spark', 'Game Over!', 64).setOrigin(0.5);


    this.finalScoreText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 100, 
                                          'moghul_outline', `Final Score: ${this.finalScore}`, 32).setOrigin(0.5);

    this.highScoreText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY + 50, 
    'moghul_outline',  `High Score: ${this.highScore}`, 32).setOrigin(0.5);

     // Main Menu button
    this.mainMenuButton = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.height - 100, 'coffee_spark', 'Main Menu', 64).setOrigin(0.5);
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
