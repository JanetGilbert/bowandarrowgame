import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import Archer from '@objects/archer.js';
import FloatScore from '@objects/floatscore.js';
import GameLevels from '@game/utility/constants.js';

export class Game extends Scene {
  static readonly DEBUGGING: boolean = false;


  // Game state
  targetsRemaining: number = 0;
  arrowsRemaining: number = 10;
  highScore: number = 0;
  
  // Game objects
  archer: Archer;
  floatScores: Phaser.GameObjects.Group;
  
  // UI elements
  private scoreText: Phaser.GameObjects.BitmapText;
  private targetsText: Phaser.GameObjects.BitmapText;
  private arrowsText: Phaser.GameObjects.BitmapText;

  constructor() {
    super('Game');
  }

  init() {
    this.arrowsRemaining = 10;
    this.targetsRemaining = 25;

  }

  preload() {

  }
 

  create() {
    // Set up physics debug rendering
    if (Game.DEBUGGING){
      this.physics.world.createDebugGraphic();
    }
    
    this.cameras.main.setBackgroundColor(0x90EE90); // Light green background

    this.createUI();

    
    this.floatScores = this.add.group({
      classType: FloatScore,
      runChildUpdate: true,
      maxSize: 20
    });

    this.archer = new Archer(this, 200, 550);
    
    this.events.off('arrowUsed');
    this.events.on('arrowUsed', this.onArrowUsed, this);

    //this.physics.add.overlap(this.archer.arrow, this.balloons, this.hitBalloon, undefined, this);
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Play background music
    const music = this.sound.add('music', { loop: true, volume: 0.5 });
    music.play();

    // Set up level scene
    const level = this.registry.get('level') || 0;

    const [levelType, phase] = GameLevels.getLevelDefinition(level);
    if (levelType === 'BalloonLevel') {
      this.scene.launch('BalloonLevel');
    }

  }

  addScore(points: number) {
    const score = this.registry.get('score') || 0;
    this.registry.set('score', score + points);
  }

  private getScore(): number {
    return this.registry.get('score') || 0;
  }

  onArrowUsed() {
    this.arrowsRemaining--;

    if (this.targetsRemaining <= 0) {
      this.scene.stop('BalloonLevel');
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

  }

  refreshUI() {
    this.scoreText.setText('Score: ' + this.getScore());
    this.arrowsText.setText(this.arrowsRemaining.toString());
    this.targetsText.setText(this.targetsRemaining.toString());
  } 
 
  gameOver() {
    this.scene.start('GameOver', { 
      score: this.getScore(), 
      highScore: this.highScore 
    });
  }
}
