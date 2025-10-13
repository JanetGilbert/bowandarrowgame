import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  background: GameObjects.Image | null = null;
  logo: GameObjects.Image | null = null;
  title: GameObjects.Text | null = null;
  instructions: GameObjects.Text | null = null;
  clickToStart: GameObjects.Text | null = null;

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
    this.logo = null;
    this.title = null;
    this.instructions = null;
    this.clickToStart = null;
  }

  create() {
    this.refreshLayout();

    // Re-calculate positions whenever the game canvas is resized (e.g. orientation change).
    this.scale.on('resize', () => this.refreshLayout());

    this.input.once('pointerdown', () => {
      this.scene.start('Game');
    });
  }

  /**
   * Positions and (lightly) scales all UI elements based on the current game size.
   * Call this from create() and from any resize events.
   */
  private refreshLayout(): void {
    const { width, height } = this.scale;

    // Resize camera to new viewport to prevent black bars
    this.cameras.resize(width, height);

    // Background – stretch to fill the whole canvas
    if (!this.background) {
      this.background = this.add.image(0, 0, 'background').setOrigin(0);
    }
    this.background!.setDisplaySize(width, height);

    // Logo – keep aspect but scale down for very small screens
    const scaleFactor = Math.min(width / 1024, height / 768);

    if (!this.logo) {
      this.logo = this.add.image(0, 0, 'logo');
    }
    this.logo!.setPosition(width / 2, height * 0.38).setScale(scaleFactor);

    // Title text – create once, then scale on resize
    const baseFontSize = 38;
    if (!this.title) {
      this.title = this.add
        .text(0, 0, 'Bow & Arrow', {
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
    this.title!.setScale(scaleFactor);

    // Instructions text
    if (!this.instructions) {
      this.instructions = this.add
        .text(0, 0, 'Q/A: Move Up/Down\nSPACE: Draw & Fire Arrow\nHit the red balloons!', {
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
    });
  }
}
