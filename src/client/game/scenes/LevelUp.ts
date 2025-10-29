import { Scene } from 'phaser';
import * as Phaser from 'phaser';

export class LevelUp extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image | null = null;
  levelupText: Phaser.GameObjects.BitmapText | null = null;
  nextLevelText: Phaser.GameObjects.BitmapText | null = null;
  nextLevelButton: Phaser.GameObjects.BitmapText | null = null;

  constructor() {
    super('LevelUp');
  }

  init(): void {
    this.levelupText = null;
    this.nextLevelText = null;
    this.nextLevelButton = null;
    this.background = null;

  }

  create() {
    this.camera = this.cameras.main;

    if (!this.background) {
      this.background = this.add.image(0, 0, 'title_background').setOrigin(0);
    }

    this.levelupText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 200, 
                                           'moghul_outline', 'Level Up!', 64).setOrigin(0.5);

    const currentLevel = this.registry.get('level') || 0;
    const nextLevel = currentLevel + 2;
    
    this.nextLevelText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'moghul_outline', `Next Level: ${nextLevel}`, 32).setOrigin(0.5);

     // Next level button
    this.nextLevelButton = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.height -100, 'coffee_spark', 'Start!', 64).setOrigin(0.5);
    this.nextLevelButton.setInteractive();

    this.nextLevelButton.on('pointerover', () => {
      this.nextLevelButton?.setTint(0xc7bfff);
    });

    this.nextLevelButton.on('pointerout', () => {
      this.nextLevelButton?.clearTint(); 
    });

    // Click effects
    this.nextLevelButton.on('pointerdown', () => {
      this.nextLevelButton?.setPosition(this.nextLevelButton.x + 2, this.nextLevelButton.y + 2); // Shadow effect
    });

    this.nextLevelButton.on('pointerup', () => {
      this.nextLevelButton?.setPosition(this.nextLevelButton.x - 2, this.nextLevelButton.y - 2); // Remove shadow
      this.nextLevel();
    });          
    
    // Add half second delay before accepting keyboard input
    this.time.delayedCall(500, () => {

      this.input.keyboard!.once('keydown-SPACE', () => {
        this.nextLevel();
      });
    });
  }

  private nextLevel(): void {
    const currentLevel = this.registry.get('level') || 0;
    this.registry.set('level', currentLevel + 1);
    this.scene.start('Game');
  }

}
