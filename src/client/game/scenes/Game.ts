import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import Archer from '../objects/archer.js';
import Balloon from '../objects/balloon.js';
import FloatScore from '../objects/floatscore.js';

export class Game extends Scene {
  // Game state
  targetsRemaining: number = 0;
  arrowsRemaining: number = 10;
  highScore: number = 0;
  
  // Game objects
  archer: Archer;
  balloons: Phaser.GameObjects.Group;
  floatScores: Phaser.GameObjects.Group;
  
  // UI elements
  scoreText: Phaser.GameObjects.BitmapText;
  targetsText: Phaser.GameObjects.BitmapText;
  arrowsText: Phaser.GameObjects.BitmapText;

  constructor() {
    super('Game');
  }

  init() {
    this.arrowsRemaining = 10;
    this.targetsRemaining = 25;
  }

  preload() {
    this.load.spritesheet('archer', 'assets/archer.png', { frameWidth: 144, frameHeight: 144 });
    this.load.image('arrow', 'assets/arrow.png');
    this.load.image('balloon', 'assets/balloon.png');
    this.load.spritesheet('balloon_particles', 'assets/balloon_particles.png', { frameWidth: 16, frameHeight: 16});
    this.load.audio('pop', 'assets/sound/pop.wav');
    this.load.audio('music', 'assets/sound/cuddle_clouds.mp3');
    this.load.bitmapFont('moghul', 'assets/fonts/Moghul.png', 'assets/fonts/Moghul.xml');
    this.load.bitmapFont('moghul_white', 'assets/fonts/moghul_white.png', 'assets/fonts/moghul_white.xml');
    this.load.image('target', 'assets/target.png');
    //this.textures.get('chickenpie').setFilter(Phaser.Textures.FilterMode.LINEAR);
  }
 

  create() {
    // Set up the game world
    this.cameras.main.setBackgroundColor(0x90EE90); // Light green background

    this.createUI();

    
    this.floatScores = this.add.group({
      classType: FloatScore,
      runChildUpdate: true,
      maxSize: 20
    });

    this.balloons = this.add.group({
      classType: Balloon,
      maxSize: 10,
      runChildUpdate: true
    });

    this.archer = new Archer(this, 200, 550);
    this.addBalloons();
    
    // Listen for arrow used event
    this.events.off('arrowUsed');
    this.events.on('arrowUsed', this.onArrowUsed, this);

    this.physics.add.overlap(this.archer.arrow, this.balloons, this.hitBalloon, undefined, this);
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Play background music
    const music = this.sound.add('music', { loop: true, volume: 0.5 });
    music.play();

  }

  hitBalloon(arrow: any, balloon: any) {
    console.log('Balloon score: ' + Balloon.score + " arrow multiplier: " + arrow.multiplier);
    const scoreToAdd = Balloon.score * arrow.multiplier;
    this.floatScores.add(new FloatScore(this, balloon.x, balloon.y, scoreToAdd, balloon.tint));
    this.addScore(scoreToAdd);
    balloon.explode();
    arrow.multiplier += 10;
    this.targetsRemaining = Math.max(0, this.targetsRemaining - 1);
    this.refreshUI();
  }

  private addScore(points: number) {
    const score = this.registry.get('score') || 0;
    this.registry.set('score', score + points);
  }

  private getScore(): number {
    return this.registry.get('score') || 0;
  }

  onArrowUsed() {
    this.arrowsRemaining--;

    if (this.targetsRemaining <= 0) {
      this.scene.start('LevelUp');
    }else if (this.arrowsRemaining <= 0) {
      this.gameOver();
    }
    this.refreshUI();
  }

  createUI() {
    this.scoreText = this.add.bitmapText(20, 20, 'moghul', 'Score: ' + this.getScore(), 24);
    this.add.image(235, 30, 'arrow');
    this.arrowsText = this.add.bitmapText(250, 20, 'moghul', this.arrowsRemaining.toString(), 24);
    this.add.image(315, 30, 'target');
    this.targetsText = this.add.bitmapText(340, 20, 'moghul', this.targetsRemaining.toString(), 24);
  }

  override update() {
    this.archer.update();
    
    if (this.balloons.children.size === 0) {
      this.addBalloons();
    }
  }

  refreshUI() {
    this.scoreText.setText('Score: ' + this.getScore());
    this.arrowsText.setText(this.arrowsRemaining.toString());
    this.targetsText.setText(this.targetsRemaining.toString());
  } 

  addBalloons() {


    this.balloons.createMultiple({ key: 'balloon', quantity: 7, setXY: { x: 0, y: 50, stepX: 0, stepY: 50 }   });
    
    this.balloons.children.entries.forEach(balloon => {
      (balloon as any).body.setCircle(20);
    });

  }

 
  gameOver() {
    this.scene.start('GameOver', { 
      score: this.getScore(), 
      highScore: this.highScore 
    });
  }
}
