import { Scene } from 'phaser';
import * as Phaser from 'phaser';

export class Settings extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image | null = null;
  titleText: Phaser.GameObjects.BitmapText | null = null;
  effectsText: Phaser.GameObjects.BitmapText | null = null;
  musicText: Phaser.GameObjects.BitmapText | null = null;
  backButton: Phaser.GameObjects.BitmapText | null = null;

  constructor() {
    super('Settings');
  }

  init(): void {
    this.effectsText = null;
    this.musicText = null;
    this.background = null;

  }

  create() {
    this.camera = this.cameras.main;

    if (!this.background) {
      this.background = this.add.image(0, 0, 'title_background').setOrigin(0);
    }

    this.titleText = this.add.bitmapText(this.cameras.main.centerX, 50, 
                                           'coffee_spark', 'Settings', 48).setOrigin(0.5);


    // Effects volume slider
    this.effectsText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 100, 'moghul_outline', `Effects`, 32).setOrigin(0.5);

    const sliderTrack = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY - 50, 200, 10, 0x666666);
    
    const currentVolume = (this.registry.get('sfxVolume') || 0.0) * 2;
    const sliderHandle = this.add.circle(this.cameras.main.centerX - 100 + (currentVolume * 200), this.cameras.main.centerY - 50, 15, 0xffffff);
    sliderHandle.setInteractive({ draggable: true });
    
    sliderHandle.on('drag', (pointer: any, dragX: number) => {
      // Constrain to slider track
      const minX = this.cameras.main.centerX - 100;
      const maxX = this.cameras.main.centerX + 100;
      const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
      
      sliderHandle.x = clampedX;
      
      // Calculate volume (0.0 to 1.0)
      const volume = ((clampedX - minX) / 200)/2;

      this.registry.set('sfxVolume', volume);   
    });
    sliderHandle.on('dragend', (pointer: any, dragX: number) => {
      const sfxVolume = this.registry.get('sfxVolume');
      this.sound.play('glass', { volume: sfxVolume || 0.0 });
    });
 
      
    // Music volume slider
    this.musicText = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY + 50, 'moghul_outline', `Music`, 32).setOrigin(0.5);

    const musicSliderTrack = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY + 100, 200, 10, 0x666666);
    
    const currentMusicVolume = this.registry.get('musicVolume') || 1.0;
    const musicSliderHandle = this.add.circle(this.cameras.main.centerX - 100 + (currentMusicVolume * 200), this.cameras.main.centerY + 100, 15, 0xffffff);
    musicSliderHandle.setInteractive({ draggable: true });
    
    musicSliderHandle.on('drag', (pointer: any, dragX: number) => {
      // Constrain to slider track
      const minX = this.cameras.main.centerX - 100;
      const maxX = this.cameras.main.centerX + 100;
      const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
      
      musicSliderHandle.x = clampedX;
      
      // Calculate volume (0.0 to 1.0)
      const volume = (clampedX - minX) / 200;
      this.registry.set('musicVolume', volume);
      // Update music volume if music is playing
      const music = this.sound.get('music') as Phaser.Sound.WebAudioSound;
      if (music) {
        music.setVolume(volume);
      }
    });    

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
