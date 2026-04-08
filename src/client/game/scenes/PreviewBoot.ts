import { Scene } from 'phaser';

export class PreviewBoot extends Scene {
  constructor() {
    super('PreviewBoot');
  }

  preload() {
    this.load.image('splash_background', 'assets/backgrounds/splash_background.png');
    this.load.bitmapFont('coffee_spark', 'assets/fonts/CoffeeSpark.png', 'assets/fonts/CoffeeSpark.xml');
    this.load.bitmapFont('moghul', 'assets/fonts/Moghul.png', 'assets/fonts/Moghul.xml');
    this.load.image('balloon', 'assets/balloon.png');
  }

  create() {
    this.scene.start('Preview');
  }
}
