import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    //  We loaded this image in our Boot Scene, so we can display it here
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background');

    // Ttle
    this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 200, 'coffee_spark', 'ZenArcher', 64).setOrigin(0.5);

    //  A simple progress bar. This is the outline of the bar.
    const progressBarWidth = 150;
    const progressBarHeight = 30;
    this.add.rectangle(this.cameras.main.centerX, 
                      this.cameras.main.centerY + 100, 
                      progressBarWidth, 
                      progressBarHeight).setStrokeStyle(1, 0xfebfff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(this.cameras.main.centerX - (progressBarWidth/2), 
                                  this.cameras.main.centerY + 100, 
                                  4, 
                                  progressBarHeight - 4, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on('progress', (progress: number) => {
      //  Update the progress bar 
      bar.width = 4 + (progressBarWidth - 4) * progress;
    });
  }

  preload() {
    this.load.setPath('assets');

    // Fonts
    this.load.bitmapFont('moghul', 'fonts/Moghul.png', 'fonts/Moghul.xml');
    this.load.bitmapFont('moghul_white', 'fonts/moghul_white.png', 'fonts/moghul_white.xml');


    // Images and spritesheets
    this.load.image('logo', 'logo.png');
    this.load.spritesheet('archer', 'archer.png', { frameWidth: 144, frameHeight: 144 });
    this.load.image('arrow', 'arrow.png');
    this.load.image('balloon', 'balloon.png');
    this.load.spritesheet('balloon_particles', 'balloon_particles.png', { frameWidth: 16, frameHeight: 16});;

    this.load.image('target', 'target.png');
    this.load.spritesheet('bubble', 'bubble.png', { frameWidth: 50, frameHeight: 50 });
    this.load.spritesheet('bird', 'bird.png', { frameWidth: 50, frameHeight: 50 });
    this.load.spritesheet('paper_particles', 'paper_particles.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('balls', 'balls.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image('snowflake', 'snowflake.png');
    this.load.spritesheet('snowflake_particles', 'snowflake_particles.png', { frameWidth: 8, frameHeight: 8 });

    // Backgrounds
    this.load.image('land_background', 'backgrounds/land_background.png');
    this.load.image('colorful_background', 'backgrounds/colorful_background.png');
    this.load.image('land2_background', 'backgrounds/land2_background.png');
    this.load.image('sea_background', 'backgrounds/sea_background.png');
    this.load.image('snow_background', 'backgrounds/snow_background.png');
    this.load.image('title_background', 'backgrounds/title_background.png');


    // Sounds
    this.load.audio('pop', 'sound/pop.wav');
    this.load.audio('pop2', 'sound/pop2.wav');
    this.load.audio('rustle', 'sound/rustle.wav');
    this.load.audio('glass', 'sound/glass.wav');
    this.load.audio('music', 'sound/cuddle_clouds.mp3')
    this.load.audio('tennis', 'sound/tennis.wav')
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start('MainMenu');
  }
}
