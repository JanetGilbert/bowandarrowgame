import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  background: GameObjects.Image | null = null;
  title: GameObjects.BitmapText | null = null;
  startButton: GameObjects.BitmapText | null = null;
  settingsButton: GameObjects.BitmapText | null = null;
  instructionsButton: GameObjects.BitmapText | null = null;
  copyrightText: GameObjects.Text | null = null;
  music: Phaser.Sound.BaseSound | null = null;

  constructor() {
    super('MainMenu');
  }

  /**
   * Reset cached GameObject references every time the scene starts.
   * The same Scene instance is reused by Phaser, so we must ensure
   * stale (destroyed) objects are cleared out when the scene restarts.
   */
  init(): void {
    this.background = null;
    this.title = null;
    this.startButton = null;
    this.settingsButton = null;
    this.instructionsButton = null;
    this.copyrightText = null;

  }

  create() {
    this.registry.set('level', 0);
    this.registry.set('score', 0);
    const sfxVolume = this.registry.get('sfxVolume');
console.log('SFX volume on main menu create:', sfxVolume);
    if (sfxVolume === undefined) {
      this.registry.set('sfxVolume', 0.5); // Default volume
    }

    this.refreshLayout();

    // Re-calculate positions whenever the game canvas is resized (e.g. orientation change).
    this.scale.on('resize', () => this.refreshLayout());

    // Play background music
    if (!this.music) { 
      this.music = this.sound.add('music', { loop: true, volume: 1.0 });
      this.music.play();
    }
    }
 
  /**
   * Positions and (lightly) scales all UI elements based on the current game size.
   * Call this from create() and from any resize events.
   */
  private refreshLayout(): void {
    const { width, height } = this.scale;

    this.background = this.add.image(0, 0, 'title_background').setOrigin(0);

    // Logo – keep aspect but scale down for very small screens
   // const scaleFactor = Math.min(width / 1024, height / 768);

    // Title
    this.title = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 200, 'coffee_spark', 'ZenArcher', 64).setOrigin(0.5);


    // Start button
    this.startButton = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'coffee_spark', 'Start!', 48).setOrigin(0.5);
    this.startButton.setInteractive();

    this.startButton.on('pointerover', () => {
      this.startButton?.setTint(0xc7bfff);
    });

    this.startButton.on('pointerout', () => {
      this.startButton?.clearTint(); // Remove highlight
    });

    this.startButton.on('pointerdown', () => {
      this.startButton?.setPosition(this.startButton.x + 2, this.startButton.y + 2); // Shadow effect
    });

    this.startButton.on('pointerup', () => {
      this.startButton?.setPosition(this.startButton.x - 2, this.startButton.y - 2); // Remove shadow
      this.scene.start('Game');
    });

    // Settings button
    this.settingsButton = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY + 120, 'moghul_outline', 'Settings', 36).setOrigin(0.5);
    this.settingsButton.setInteractive();

    this.settingsButton.on('pointerover', () => {
      this.settingsButton?.setTint(0xc7bfff);
    });

    this.settingsButton.on('pointerout', () => {
      this.settingsButton?.clearTint();
    });

    this.settingsButton.on('pointerdown', () => {
      this.settingsButton?.setPosition(this.settingsButton.x + 2, this.settingsButton.y + 2);
    });

    this.settingsButton.on('pointerup', () => {
      this.settingsButton?.setPosition(this.settingsButton.x - 2, this.settingsButton.y - 2);
      this.scene.start('Settings');
    });

    // Instructions button
    this.instructionsButton = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY + 190, 'moghul_outline', 'How to Play', 36).setOrigin(0.5);
    this.instructionsButton.setInteractive();

    this.instructionsButton.on('pointerover', () => {
      this.instructionsButton?.setTint(0xc7bfff);
    });

    this.instructionsButton.on('pointerout', () => {
      this.instructionsButton?.clearTint();
    });

    this.instructionsButton.on('pointerdown', () => {
      this.instructionsButton?.setPosition(this.instructionsButton.x + 2, this.instructionsButton.y + 2);
    });

    this.instructionsButton.on('pointerup', () => {
      this.instructionsButton?.setPosition(this.instructionsButton.x - 2, this.instructionsButton.y - 2);
      this.scene.start('Instructions');
    });




    // Copyright
    // this.copyrightText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.height - 50, 'moghul_outline', '© 2025 DevilEggGames', 24).setOrigin(0.5);
    if (!this.copyrightText) {
      this.copyrightText = this.add
        .text(0, 0, '© 2025 DevilEggGames', {
          fontFamily: 'Arial',
          fontSize: `12px`,
          color: '#000000',
          align: 'center',
        })
        .setOrigin(0.5);
    }
    this.copyrightText!.setPosition(width / 2, height - 50);


   /* // Title text – create once, then scale on resize
    const baseFontSize = 38;
    if (!this.title) {
      this.title = this.add
        .text(0, 0, 'ZenArcher', {
          fontFamily: 'Arial Black',
          fontSize: `${baseFontSize}px`,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 8,
          align: 'center',
        })
        .setOrigin(0.5);
    }
    this.title!.setPosition(width / 2, height * 0.6);
    this.title!.setScale(scaleFactor);*/

    // Instructions text
  /*  if (!this.instructions) {
      this.instructions = this.add
        .text(0, 0, 'Drag to Move & Fire\nQ/W: Move Left/Right\nSPACE: Draw & Fire Arrow\nHit the red balloons!', {
          fontFamily: 'Arial',
          fontSize: '20px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2,
          align: 'center',
        })
        .setOrigin(0.5);
    }
    this.instructions!.setPosition(width / 2, height * 0.75);
    this.instructions!.setScale(scaleFactor);

    // Click to start text
    if (!this.clickToStart) {
      this.clickToStart = this.add
        .text(0, 0, 'CLICK ANYWHERE TO START', {
          fontFamily: 'Arial Black',
          fontSize: '28px',
          color: '#ffff00',
          stroke: '#000000',
          strokeThickness: 4,
          align: 'center',
        })
        .setOrigin(0.5);
    }
    this.clickToStart!.setPosition(width / 2, height * 0.85);
    this.clickToStart!.setScale(scaleFactor);

    // Add pulsing animation to the click to start text
    this.tweens.add({
      targets: this.clickToStart,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });*/


  }
}
