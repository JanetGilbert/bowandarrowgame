import { Scene } from 'phaser';
import * as Phaser from 'phaser';

export class LevelUp extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  levelup_text: Phaser.GameObjects.Text;
  finalScoreText: Phaser.GameObjects.Text;
  highScoreText: Phaser.GameObjects.Text;
  restartText: Phaser.GameObjects.Text;

  constructor() {
    super('LevelUp');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x90EE90); // Light green background

    // Background – create once, full-screen
    this.background = this.add.image(0, 0, 'background').setOrigin(0).setAlpha(0.3);

    this.levelup_text = this.add
      .text(0, 0, 'Level Up!', {
        fontFamily: 'Arial Black',
        fontSize: '24px',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5);

    // Restart instruction
    this.restartText = this.add
      .text(0, 0, 'Click or Press SPACE for level ' + ((this.registry.get('level') || 1) + 1), {
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

    // Add half second delay before accepting input
    this.time.delayedCall(500, () => {
      this.input.once('pointerdown', () => {
        this.nextLevel();
      });

      this.input.keyboard!.once('keydown-SPACE', () => {
        this.nextLevel();
      });
    });
  }

  private nextLevel(): void {
    const currentLevel = this.registry.get('level') || 1;
    this.registry.set('level', currentLevel + 1);
    this.scene.start('Game');
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
    if (this.levelup_text) {
      this.levelup_text.setPosition(width / 2, height * 0.3);
      this.levelup_text.setScale(scaleFactor);
    }
    
    if (this.restartText) {
      this.restartText.setPosition(width / 2, height * 0.7);
      this.restartText.setScale(scaleFactor);
    }
  }
}
