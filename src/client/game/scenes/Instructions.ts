import { Scene } from 'phaser';
import * as Phaser from 'phaser';

export class Instructions extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image | null = null;
  instructionsTitle: Phaser.GameObjects.BitmapText | null = null;
  instructionsText1: Phaser.GameObjects.BitmapText | null = null;
  instructionsText2: Phaser.GameObjects.BitmapText | null = null;
  instructionsText3: Phaser.GameObjects.BitmapText | null = null;
  instructionsText4: Phaser.GameObjects.BitmapText | null = null;
  instructionsText5: Phaser.GameObjects.BitmapText | null = null;
  instructionsText6: Phaser.GameObjects.BitmapText | null = null;
  instructionsText7: Phaser.GameObjects.BitmapText | null = null;
  instructionsText8: Phaser.GameObjects.BitmapText | null = null;
  targetImage: Phaser.GameObjects.Image | null = null;
  arrowImage: Phaser.GameObjects.Image | null = null;
  backButton: Phaser.GameObjects.BitmapText | null = null;

  constructor() {
    super('Instructions');
  }

  init(): void {
    this.instructionsTitle = null;
    this.instructionsText1 = null;
    this.instructionsText2 = null;
    this.instructionsText3 = null;
    this.instructionsText4 = null;
    this.instructionsText5 = null;
    this.instructionsText6 = null;
    this.instructionsText7 = null;
    this.instructionsText8 = null;
    this.backButton = null;
    this.background = null;
    this.targetImage = null;
    this.arrowImage = null;
  }

  create() {
    this.camera = this.cameras.main;

    this.background = this.add.image(0, 0, 'title_background').setOrigin(0);


    this.instructionsText1 = this.add.bitmapText(this.cameras.main.centerX, 50, 'coffee_spark', 
                          'How to Play', 48).setOrigin(0.5);

    this.instructionsText1 = this.add.bitmapText(this.cameras.main.centerX, 100, 'moghul_outline', 
                             'Shoot the targets to score points', 24).setOrigin(0.5);

    this.instructionsText2 = this.add.bitmapText(this.cameras.main.centerX, 130, 'moghul_outline', 
                             'and level up!', 24).setOrigin(0.5);


    this.instructionsText3 = this.add.bitmapText(120, 180, 'moghul_outline', 
                             'Targets left:', 24).setOrigin(0);
    this.targetImage = this.add.image(260, 175, 'target').setOrigin(0);


    this.instructionsText4 = this.add.bitmapText(130, 230, 'moghul_outline', 
                             'Arrows left:', 24).setOrigin(0);
    this.arrowImage = this.add.image(260, 230, 'arrow').setOrigin(0);

    this.instructionsText5 = this.add.bitmapText(this.cameras.main.centerX, 300, 'moghul_outline', 
                              'Drag left and right to move archer', 24).setOrigin(0.5);

    this.instructionsText6 = this.add.bitmapText(this.cameras.main.centerX, 350, 'moghul_outline', 
                              'Tap and release to fire arrow', 24).setOrigin(0.5);

    this.instructionsText7 = this.add.bitmapText(this.cameras.main.centerX, 400, 'moghul_outline', 
                              'Keyboard controls:', 24).setOrigin(0.5);

    this.instructionsText8 = this.add.bitmapText(this.cameras.main.centerX, 430, 'moghul_outline', 
                              '[Q] Left, [E] Right, [Space] Fire', 24).setOrigin(0.5);

     // Back button
    this.backButton = this.add.bitmapText(this.cameras.main.centerX, 530, 'coffee_spark', 'Main Menu', 48).setOrigin(0.5);
    this.backButton.setInteractive();

    this.backButton.on('pointerover', () => {
      this.backButton?.setTint(0xc7bfff);
    });

    this.backButton.on('pointerout', () => {
      this.backButton?.clearTint(); 
    });

    this.backButton.on('pointerdown', () => {
      this.backButton?.setPosition(this.backButton.x + 2, this.backButton.y + 2); // Shadow effect
    });

    this.backButton.on('pointerup', () => {
      this.backButton?.setPosition(this.backButton.x - 2, this.backButton.y - 2); // Remove shadow
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
