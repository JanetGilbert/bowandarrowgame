import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import Archer from '../objects/archer.js';
import Balloon from '../objects/balloon.js';

export class Game extends Scene {
  // Game state
  score: number = 0;
  targetsRemaining: number = 0;
  level: number = 1;
  arrowsRemaining: number = 10;
  highScore: number = 0;
  
  // Game objects
  archer: Archer;
  balloons: Phaser.GameObjects.Group;
  
  // UI elements
  scoreText: Phaser.GameObjects.BitmapText;
  targetsText: Phaser.GameObjects.BitmapText;
  arrowsText: Phaser.GameObjects.BitmapText;

  constructor() {
    super('Game');
  }

  init() {
    // Reset game state when starting new game
    this.score = 0;
    this.arrowsRemaining = 10;
    this.targetsRemaining = 25;
  }

  preload() {
    this.load.spritesheet('archer', 'assets/archer.png', { frameWidth: 144, frameHeight: 144 });
    this.load.image('arrow', 'assets/arrow.png');
    this.load.image('balloon', 'assets/balloon.png');
    this.load.spritesheet('balloon_particles', 'assets/balloon_particles.png', { frameWidth: 16, frameHeight: 16});
    this.load.audio('pop', 'assets/pop.wav');
    this.load.bitmapFont('moghul', 'assets/fonts/Moghul.png', 'assets/fonts/Moghul.xml');
    this.load.image('target', 'assets/target.png');
    //this.textures.get('chickenpie').setFilter(Phaser.Textures.FilterMode.LINEAR);
  }
 

  create() {
    // Set up the game world
    this.cameras.main.setBackgroundColor(0x90EE90); // Light green background


    // Create UI
    this.createUI();
    
    // Update UI with initial values
    //this.scoreText.setText('Score: 0');
    //this.arrowsText.setText('Arrows: 10');


    this.archer = new Archer(this, 200, 550);
    this.addBalloons();
    

    this.physics.add.overlap(this.archer.arrow, this.balloons, this.hitBalloon, undefined, this);
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

  }

  hitBalloon(arrow: any, balloon: any) {
      balloon.explode();
      this.score += balloon.score * arrow.multiplier;
      arrow.multiplier += 10;
  }

  createUI() {
    // Score background
   /*this.add.graphics()
      .fillStyle(0xffffff)
      .lineStyle(2, 0x000000)
      .fillRoundedRect(15, 15, 90, 30, 8)
      .strokeRoundedRect(15, 15, 90, 30, 8);*/

    const fontStyle = {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#000000',
      resolution: window.devicePixelRatio,
      shadow: {
                color: '#000000',
                fill: true,
                offsetX: 2,
                offsetY: 2,
                blur: 4
            }
    };
    
    this.scoreText = this.add.bitmapText(20, 20, 'moghul', 'Score: ' + this.score, 24);

    this.add.image(225, 30, 'target');
    this.arrowsText = this.add.bitmapText(250, 20, 'moghul', this.arrowsRemaining.toString(), 24);
    this.add.image(325, 30, 'arrow');
    this.targetsText = this.add.bitmapText(340, 20, 'moghul', this.targetsRemaining.toString(), 24);
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
    this.scene.start('GameOver', { 
      score: this.score, 
      highScore: this.highScore 
    });
  }
}
