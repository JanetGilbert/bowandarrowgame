import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import Archer from '../objects/archer.js';
import Balloon from '../objects/balloon.js';
import Arrow from '../objects/arrow.js';

export class Game extends Scene {
  // Game state
  score: number = 0;
  highScore: number = 0;
  level: number = 1;
  arrowsRemaining: number = 10;
  
  // Game objects
  archer: Archer;
  balloons: Phaser.GameObjects.Group;
  
  // UI elements
  scoreText: Phaser.GameObjects.Text;
  highScoreText: Phaser.GameObjects.Text;
  levelText: Phaser.GameObjects.Text;
  arrowsText: Phaser.GameObjects.Text;

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
    this.load.image('arrow', 'assets/arrow.png');
    this.load.image('balloon', 'assets/balloon.png');
  }


  create() {
    // Set up the game world
    this.cameras.main.setBackgroundColor(0x90EE90); // Light green background


    // Create UI
    this.createUI();
    
    // Update UI with initial values
    this.scoreText.setText('Score: 0');
    this.arrowsText.setText('Arrows: 10');


    this.archer = new Archer(this, 200, 550);
    this.addBalloons();
    this.physics.add.overlap(this.archer.arrow, this.balloons, this.hitBalloon, undefined, this);
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

    //this.archer.anims.play('idle');

    
    // Start game loop
    /*this.time.addEvent({
      delay: 1000,
      callback: this.gameLoop,
      callbackScope: this,
      loop: true
    });*/
  }

  hitBalloon(arrow: any, balloon: any) {
      balloon.destroy();
  }

  createUI() {
    // Score display (fixed portrait positioning)
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontFamily: 'Arial',
      fontSize: '18px',
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
    this.archer.update();
    
    if (this.balloons.children.size === 0) {
      this.addBalloons();
    }
  }

  addBalloons() {
    if (!this.balloons) {
      this.balloons = this.add.group({
        classType: Balloon,
        maxSize: 10,
        runChildUpdate: true
      });
    }

  this.balloons.createMultiple({ key: 'balloon', quantity: 7, setXY: { x: 0, y: 50, stepX: 0, stepY: 50 }   });
  
  this.balloons.children.entries.forEach(balloon => {
    (balloon as any).body.setCircle(20);
  });

  }

 
  gameOver() {
    // Navigate to game over scene with score data
    this.scene.start('GameOver', { 
      score: this.score, 
      highScore: this.highScore 
    });
  }
}
