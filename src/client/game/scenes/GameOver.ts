import { Scene } from 'phaser';
import * as Phaser from 'phaser';

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameover_text: Phaser.GameObjects.Text;
  finalScoreText: Phaser.GameObjects.Text;
  highScoreText: Phaser.GameObjects.Text;
  restartText: Phaser.GameObjects.Text;
  
  finalScore: number = 0;
  highScore: number = 0;

  constructor() {
    super('GameOver');
  }

  init(data: { score?: number, highScore?: number }) {
    // Get score data from the game scene
    this.finalScore = data.score || 0;
    this.highScore = data.highScore || 0;
  }

  create() {
    // Configure camera
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x90EE90); // Light green background

    // Background – create once, full-screen
    this.background = this.add.image(0, 0, 'background').setOrigin(0).setAlpha(0.3);

    // "Game Over" text – created once and scaled responsively
    this.gameover_text = this.add
      .text(0, 0, 'Game Over!', {
        fontFamily: 'Arial Black',
        fontSize: '64px',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5);

    // Final score text
    this.finalScoreText = this.add
      .text(0, 0, `Final Score: ${this.finalScore}`, {
        fontFamily: 'Arial',
        fontSize: '36px',
        color: '#000000',
        align: 'center',
      })
      .setOrigin(0.5);

    // High score text
    this.highScoreText = this.add
      .text(0, 0, `High Score: ${this.highScore}`, {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#000000',
        align: 'center',
      })
      .setOrigin(0.5);

    // Restart instruction
    this.restartText = this.add
      .text(0, 0, 'Click or Press SPACE to Play Again', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#000000',
        align: 'center',
      })
      .setOrigin(0.5);

    // Initial responsive layout
    this.updateLayout(this.scale.width, this.scale.height);

    // Update layout on canvas resize / orientation change
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const { width, height } = gameSize;
      this.updateLayout(width, height);
    });

    // Return to Main Menu on tap / click or space key
    this.input.once('pointerdown', () => {
      this.scene.start('MainMenu');
    });

    // Add space key input
    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('MainMenu');
    });
  }

  private updateLayout(width: number, height: number): void {
    // Resize camera viewport to prevent black bars
    this.cameras.resize(width, height);

    // Stretch background to fill entire screen
    if (this.background) {
      this.background.setDisplaySize(width, height);
    }

    // Compute scale factor (never enlarge above 1×)
    const scaleFactor = Math.min(Math.min(width / 1024, height / 768), 1);

    // Centre and scale all text elements
    if (this.gameover_text) {
      this.gameover_text.setPosition(width / 2, height * 0.3);
      this.gameover_text.setScale(scaleFactor);
    }

    if (this.finalScoreText) {
      this.finalScoreText.setPosition(width / 2, height * 0.45);
      this.finalScoreText.setScale(scaleFactor);
    }

    if (this.highScoreText) {
      this.highScoreText.setPosition(width / 2, height * 0.55);
      this.highScoreText.setScale(scaleFactor);
    }

    if (this.restartText) {
      this.restartText.setPosition(width / 2, height * 0.7);
      this.restartText.setScale(scaleFactor);
    }
  }
}
