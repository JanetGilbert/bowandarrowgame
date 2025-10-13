import { Scene } from 'phaser';
import * as Phaser from 'phaser';

export class Game extends Scene {
  // Game state
  score: number = 0;
  highScore: number = 0;
  level: number = 1;
  arrowsRemaining: number = 20;
  
  // Game objects
  archer: Phaser.GameObjects.Rectangle;
  bow: Phaser.GameObjects.Rectangle;
  arrow: Phaser.GameObjects.Rectangle;
  balloons: Phaser.GameObjects.Group;
  balloonPops: Phaser.GameObjects.Group;
  
  // UI elements
  scoreText: Phaser.GameObjects.Text;
  highScoreText: Phaser.GameObjects.Text;
  levelText: Phaser.GameObjects.Text;
  arrowsText: Phaser.GameObjects.Text;
  
  // Game mechanics
  isDrawingBow: boolean = false;
  bowDrawPower: number = 0;
  maxBowPower: number = 100;
  arrowInFlight: boolean = false;
  arrowVelocity: Phaser.Math.Vector2;
  
  // Input
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  spaceKey: Phaser.Input.Keyboard.Key;
  qKey: Phaser.Input.Keyboard.Key;
  aKey: Phaser.Input.Keyboard.Key;
  
  // Game settings
  archerSpeed: number = 200;
  balloonSpeed: number = 30;
  arrowSpeed: number = 400;

  constructor() {
    super('Game');
  }

  create() {
    // Set up the game world
    this.cameras.main.setBackgroundColor(0x90EE90); // Light green background
    
    // Create archer sprite (simple colored rectangle for now)
    this.archer = this.add.rectangle(100, 400, 40, 80, 0x8B4513); // Brown archer
    this.archer.setOrigin(0.5, 0.5);
    
    // Create bow sprite
    this.bow = this.add.rectangle(120, 400, 20, 60, 0x654321); // Darker brown bow
    this.bow.setOrigin(0.5, 0.5);
    
    // Create arrow sprite (initially hidden)
    this.arrow = this.add.rectangle(140, 400, 30, 4, 0x696969); // Gray arrow
    this.arrow.setOrigin(0, 0.5);
    this.arrow.setVisible(false);
    
    // Create balloon group
    this.balloons = this.add.group();
    this.balloonPops = this.add.group();
    
    // Create UI
    this.createUI();
    
    // Set up input
    this.setupInput();
    
    // Create initial balloons
    this.createBalloons();
    
    // Start game loop
    this.time.addEvent({
      delay: 1000,
      callback: this.createBalloons,
      callbackScope: this,
      loop: true
    });
  }

  createUI() {
    // Score display
    this.scoreText = this.add.text(20, 20, 'Score: 0', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#000000'
    });
    
    this.highScoreText = this.add.text(20, 50, 'High Score: 0', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#000000'
    });
    
    this.levelText = this.add.text(400, 20, 'Level 1', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#000000'
    });
    
    this.arrowsText = this.add.text(800, 20, 'Arrows: 20', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#000000'
    });
  }

  setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.qKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.aKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  }

  createBalloons() {
    // Create 10 balloons in a staggered horizontal line
    const startX = 300;
    const startY = 500;
    const balloonSpacing = 50;
    
    for (let i = 0; i < 10; i++) {
      const balloon = this.add.circle(
        startX + (i * balloonSpacing),
        startY + (Math.random() * 20 - 10), // Slight vertical stagger
        15,
        0xFF0000 // Red balloon
      );
      
      // Store balloon data for manual movement
      (balloon as any).velocityY = -this.balloonSpeed;
      
      // Add balloon to group
      this.balloons.add(balloon);
      
      // Remove balloon when it goes off screen
      this.time.delayedCall(15000, () => {
        if (balloon.active) {
          balloon.destroy();
        }
      });
    }
  }

  override update() {
    // Handle archer movement (Q and A keys)
    if (!this.arrowInFlight) {
      if (this.qKey.isDown && this.archer.y > 100) {
        this.archer.y -= this.archerSpeed * this.game.loop.delta / 1000;
        this.bow.y = this.archer.y;
      }
      if (this.aKey.isDown && this.archer.y < 600) {
        this.archer.y += this.archerSpeed * this.game.loop.delta / 1000;
        this.bow.y = this.archer.y;
      }
    }

    // Handle bow drawing and arrow firing
    if (this.spaceKey.isDown && !this.arrowInFlight) {
      if (!this.isDrawingBow) {
        this.isDrawingBow = true;
        this.bowDrawPower = 0;
      }
      
      // Increase bow draw power
      this.bowDrawPower = Math.min(this.bowDrawPower + 2, this.maxBowPower);
      
      // Visual feedback for bow drawing
      this.bow.setScale(1, 1 + (this.bowDrawPower / this.maxBowPower) * 0.5);
    } else if (this.isDrawingBow && this.spaceKey.isUp) {
      // Fire arrow
      this.fireArrow();
    }

    // Update arrow in flight
    if (this.arrowInFlight) {
      this.arrow.x += this.arrowVelocity.x * this.game.loop.delta / 1000;
      this.arrow.y += this.arrowVelocity.y * this.game.loop.delta / 1000;
      
      // Check if arrow hits balloons
      this.checkArrowCollisions();
      
      // Check if arrow goes off screen
      if (this.arrow.x > 1000) {
        this.resetArrow();
      }
    }

    // Update balloons
    this.balloons.children.entries.forEach((balloon: any) => {
      if (balloon.active) {
        balloon.y += balloon.velocityY * this.game.loop.delta / 1000;
        
        // Remove balloon if it goes off screen
        if (balloon.y < -50) {
          balloon.destroy();
        }
      }
    });
  }

  fireArrow() {
    if (this.arrowInFlight) return;
    
    this.arrowInFlight = true;
    this.arrowsRemaining--;
    this.arrowsText.setText(`Arrows: ${this.arrowsRemaining}`);
    
    // Position arrow at archer
    this.arrow.setPosition(this.archer.x + 40, this.archer.y);
    this.arrow.setVisible(true);
    
    // Calculate arrow velocity based on bow power
    const power = this.bowDrawPower / this.maxBowPower;
    this.arrowVelocity = new Phaser.Math.Vector2(
      this.arrowSpeed * power,
      0 // No vertical component for now
    );
    
    // Reset bow
    this.isDrawingBow = false;
    this.bowDrawPower = 0;
    this.bow.setScale(1, 1);
    
    // Check for game over
    if (this.arrowsRemaining <= 0) {
      this.gameOver();
    }
  }

  checkArrowCollisions() {
    this.balloons.children.entries.forEach((balloon: any) => {
      if (balloon.active && this.arrow.active) {
        const distance = Phaser.Math.Distance.Between(
          this.arrow.x, this.arrow.y,
          balloon.x, balloon.y
        );
        
        if (distance < 25) {
          // Hit! Create pop animation
          this.createPopAnimation(balloon.x, balloon.y);
          
          // Remove balloon
          balloon.destroy();
          
          // Increase score
          this.score += 10;
          this.scoreText.setText(`Score: ${this.score}`);
          
          // Update high score
          if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.setText(`High Score: ${this.highScore}`);
          }
        }
      }
    });
  }

  createPopAnimation(x: number, y: number) {
    // Create a simple pop effect with multiple small circles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const popPiece = this.add.circle(
        x + Math.cos(angle) * 10,
        y + Math.sin(angle) * 10,
        3,
        0xFFD700 // Gold color
      );
      
      // Add to pop group
      this.balloonPops.add(popPiece);
      
      // Animate pop piece
      this.tweens.add({
        targets: popPiece,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 500,
        onComplete: () => popPiece.destroy()
      });
    }
  }

  resetArrow() {
    this.arrow.setVisible(false);
    this.arrowInFlight = false;
    this.arrowVelocity = new Phaser.Math.Vector2(0, 0);
  }

  gameOver() {
    // Navigate to game over scene with score data
    this.scene.start('GameOver', { 
      score: this.score, 
      highScore: this.highScore 
    });
  }
}
