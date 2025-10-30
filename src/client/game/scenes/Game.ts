import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import Archer from '@objects/archer.js';
import FloatScore from '@objects/floatscore.js';
import GameLevels from '@game/utility/constants.js';

export class Game extends Scene {
  static readonly DEBUGGING: boolean = false;
  static readonly CHEAT: boolean = true;

  // Game state
  targetsRemaining: number;
  arrowsRemaining: number;
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
   

  }

  preload() {

  }
 

  create() {
    const level = this.registry.get('level') || 0;
    const [levelType, phase, arrows, targets] = GameLevels.getLevelDefinition(level);

    // Draw background
    switch (levelType) {
      case 'BalloonLevel':
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'land_background').setOrigin(0.5);
        break;

        case 'BallLevel':
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'colorful_background').setOrigin(0.5);
        break;

      case 'BubbleLevel':
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'sea_background').setOrigin(0.5);
        break;

      case 'SnowflakeLevel':
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'snow_background').setOrigin(0.5);
        break;
      case 'BirdLevel':
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'land2_background').setOrigin(0.5);
        break;
    }

    this.floatScores = this.add.group({
      classType: FloatScore,
      runChildUpdate: true,
      maxSize: 20
    });

    this.archer = new Archer(this, 200, 550);
    
    this.events.off('arrowUsed');
    this.events.on('arrowUsed', this.onArrowUsed, this);

    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Set up level 
    console.log(`Starting level: ${levelType}, phase: ${phase}`);
    this.scene.launch(levelType, { phase: phase, targets: targets });

 
    // UI
    this.arrowsRemaining = arrows;
    this.targetsRemaining = targets;
    
    this.createUI();
    
    // Cheat key for level up
    if (Game.CHEAT) {
      this.input.keyboard?.on('keydown-ZERO', () => {
        this.removeScenes();
        this.scene.start('LevelUp');
      });
    }
  }

  addScore(points: number) {
    const score = this.registry.get('score') || 0;
    const highScore = this.registry.get('highscore') || 0;
    this.registry.set('score', score + points);

    if (score + points > highScore) {
      this.registry.set('highscore', score + points);
    }
  }

  private getScore(): number {
    return this.registry.get('score') || 0;
  }

  private getHighScore(): number {
    return this.registry.get('highscore') || 0;
  }

  onArrowUsed() {
    this.arrowsRemaining--;

    if (this.targetsRemaining <= 0) {
      this.removeScenes();
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
    this.removeScenes();
    this.scene.start('GameOver', { 
      score: this.getScore(), 
      highScore: this.getHighScore() 
    });
  }

  removeScenes() {
    this.scene.stop('BalloonLevel');
    this.scene.stop('BubbleLevel');
    this.scene.stop('BirdLevel');
    this.scene.stop('SnowflakeLevel');
    this.scene.stop('BallLevel');
  }

  getSFXVolume(): number {
    console.log('Getting SFX volume:', this.registry.get('sfxVolume'));
    return (this.registry.get('sfxVolume') || 0.0) / 2;
  }
}
