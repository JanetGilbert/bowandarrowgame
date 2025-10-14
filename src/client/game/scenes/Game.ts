import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import Archer from '../objects/archer.js';

export class Game extends Scene {
  // Game state
  score: number = 0;
  highScore: number = 0;
  level: number = 1;
  arrowsRemaining: number = 10;
  
  // Game objects
  archer: Archer;
  arrow: Phaser.GameObjects.Rectangle;
  balloons: Phaser.GameObjects.Group;
  balloonPops: Phaser.GameObjects.Group;
  
  // UI elements
  scoreText: Phaser.GameObjects.Text;
  highScoreText: Phaser.GameObjects.Text;
  levelText: Phaser.GameObjects.Text;
  arrowsText: Phaser.GameObjects.Text;
  


  
  // Game settings
  balloonSpeed: number = 50; // Increased speed for better gameplay
  arrowSpeed: number = 400;

  constructor() {
    super('Game');
  }

  init() {
    // Reset game state when starting new game
    this.score = 0;
    this.arrowsRemaining = 10;

  }

  preload() {
    this.load.spritesheet('archer', 'assets/archer.png', { frameWidth: 144, frameHeight: 144 });
  }

  private range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }


  create() {
    // Set up the game world
    this.cameras.main.setBackgroundColor(0x90EE90); // Light green background


    // Create UI
    this.createUI();
    
    // Update UI with initial values
    this.scoreText.setText('Score: 0');
    this.arrowsText.setText('Arrows: 10');

    // Animations
    this.anims.create({
        key: 'walk_left',
        frames: this.anims.generateFrameNumbers('archer', { frames: this.range(16, 31) }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'walk_right',
        frames: this.anims.generateFrameNumbers('archer', { frames: this.range(32, 47) }),
        frameRate: 8,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('archer', { frames: [48, 49]}),
        frameRate: 8,
        repeat: -1
    });

      this.anims.create({
        key: 'draw',
        frames: this.anims.generateFrameNumbers('archer', { frames: [63, 62, 61, 60]}),
        frameRate: 8,
        repeat: -1
    });

    // Create the archer sprite
    this.archer = new Archer(this, 200, 500);
    

    //this.archer.anims.play('idle');

    
    // Start game loop
    /*this.time.addEvent({
      delay: 1000,
      callback: this.gameLoop,
      callbackScope: this,
      loop: true
    });*/
  }

  createUI() {
    // Score display (fixed portrait positioning)
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#000000'
    });
    
    this.highScoreText = this.add.text(20, 45, 'High Score: 0', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#000000'
    });
    
    this.levelText = this.add.text(200, 20, 'Level 1', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#000000'
    });
    
    this.arrowsText = this.add.text(300, 20, 'Arrows: 10', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#000000'
    });
  }

  override update() {
    
  }



 
  gameOver() {
    // Navigate to game over scene with score data
    this.scene.start('GameOver', { 
      score: this.score, 
      highScore: this.highScore 
    });
  }
}
