import { Scene } from 'phaser';
import * as Phaser from 'phaser';

export class Game extends Scene {
  // Game state
  score: number = 0;
  highScore: number = 0;
  level: number = 1;
  arrowsRemaining: number = 10;
  
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
  wKey: Phaser.Input.Keyboard.Key;
  
  // Touch/Mouse controls
  isDragging: boolean = false;
  dragStartX: number = 0;
  archerStartX: number = 0;
  
  // Game settings
  archerSpeed: number = 200;
  balloonSpeed: number = 50; // Increased speed for better gameplay
  arrowSpeed: number = 400;

  constructor() {
    super('Game');
  }

  init() {
    // Reset game state when starting new game
    this.score = 0;
    this.arrowsRemaining = 10;
    this.arrowInFlight = false;
    this.isDrawingBow = false;
    this.bowDrawPower = 0;
  }

  create() {
    // Set up the game world
    this.cameras.main.setBackgroundColor(0x90EE90); // Light green background
    
    // Create archer sprite at bottom of screen (fixed portrait dimensions)
    this.archer = this.add.rectangle(200, 540, 40, 80, 0x8B4513); // Brown archer
    this.archer.setOrigin(0.5, 0.5);
    
    // Create bow sprite
    this.bow = this.add.rectangle(200, 540, 20, 60, 0x654321); // Darker brown bow
    this.bow.setOrigin(0.5, 0.5);
    
    // Create arrow sprite (initially hidden)
    this.arrow = this.add.rectangle(200, 540, 4, 30, 0x696969); // Gray arrow (vertical)
    this.arrow.setOrigin(0.5, 1); // Anchor at bottom
    this.arrow.setVisible(false);
    
    // Create balloon group
    this.balloons = this.add.group();
    this.balloonPops = this.add.group();
    
    // Create UI
    this.createUI();
    
    // Update UI with initial values
    this.scoreText.setText('Score: 0');
    this.arrowsText.setText('Arrows: 10');
    
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

  setupInput() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.qKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    
    // Touch/Mouse drag controls
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.archerStartX = this.archer.x;
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const deltaX = pointer.x - this.dragStartX;
        const newX = this.archerStartX + deltaX;
        
        // Keep archer within fixed portrait bounds
        const clampedX = Phaser.Math.Clamp(newX, 50, 350);
        this.archer.x = clampedX;
        this.bow.x = clampedX;
      }
    });
    
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.isDragging = false;
        // Fire arrow on release
        this.fireArrow();
      }
    });
  }

  createBalloons() {
    // Create balloons for fixed portrait dimensions (400x600)
    const screenWidth = 400;
    const screenHeight = 600;
    const archerY = 540;
    
    // Calculate available space above archer, avoiding score area and archer
    const scoreAreaHeight = 80; // Reserve space for score at top
    const archerAreaHeight = 60; // Reserve space for archer at bottom
    const availableHeight = archerY - scoreAreaHeight - archerAreaHeight; // Leave space for archer
    const balloonRadius = 12;
    const minSpacing = 25; // Smaller spacing for portrait
    
    // Calculate optimal grid for portrait
    const balloonsPerRow = Math.floor(screenWidth / minSpacing);
    const rows = Math.floor(availableHeight / minSpacing);
    
    // Calculate actual spacing to fill the entire available area
    const rowSpacing = availableHeight / (rows - 1); // Distribute evenly across full height
    const balloonSpacing = screenWidth / balloonsPerRow;
    
    const startY = scoreAreaHeight + 20; // Start just below score area
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < balloonsPerRow; col++) {
        const balloon = this.add.circle(
          -50, // Start off-screen to the left
          startY + (row * rowSpacing), // Evenly spaced rows from top down
          15,
          0xFF0000 // Red balloon
        );
        
        // Store balloon data for manual movement (left to right)
        (balloon as any).velocityX = this.balloonSpeed;
        (balloon as any).velocityY = 0;
        (balloon as any).row = row;
        (balloon as any).col = col;
        (balloon as any).rowSpacing = rowSpacing;
        (balloon as any).startY = startY;
        
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
  }

  override update() {
    // Handle archer movement (Q and W keys) - horizontal movement
    // Allow movement even when arrow is in flight
    if (this.qKey.isDown && this.archer.x > 50) {
      this.archer.x -= this.archerSpeed * this.game.loop.delta / 1000;
      this.bow.x = this.archer.x;
    }
    if (this.wKey.isDown && this.archer.x < 350) { // Fixed portrait width bounds
      this.archer.x += this.archerSpeed * this.game.loop.delta / 1000;
      this.bow.x = this.archer.x;
    }

    // Handle bow drawing and arrow firing (keyboard)
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
      // Fire arrow with keyboard power
      this.fireArrowWithPower();
    }

    // Update arrow in flight
    if (this.arrowInFlight) {
      this.arrow.x += this.arrowVelocity.x * this.game.loop.delta / 1000;
      this.arrow.y += this.arrowVelocity.y * this.game.loop.delta / 1000;
      
      // Check if arrow hits balloons
      this.checkArrowCollisions();
      
      // Check if arrow goes off screen (top of screen)
      if (this.arrow.y < -50) {
        this.resetArrow();
      }
    }

    // Update balloons
    this.balloons.children.entries.forEach((balloon: any) => {
      if (balloon.active) {
        balloon.x += balloon.velocityX * this.game.loop.delta / 1000;
        balloon.y += balloon.velocityY * this.game.loop.delta / 1000;
        
        // Maintain proper spacing in rows as they move
        balloon.y = balloon.startY + (balloon.row * balloon.rowSpacing);
        
        // Remove balloon if it goes off screen (right side) - fixed portrait width
        if (balloon.x > 450) {
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
    this.arrow.setPosition(this.archer.x, this.archer.y - 40);
    this.arrow.setVisible(true);
    
    // Calculate arrow velocity (upward with some power)
    const power = 0.8; // Default power for drag firing
    this.arrowVelocity = new Phaser.Math.Vector2(
      0, // No horizontal component for now
      -this.arrowSpeed * power // Negative Y for upward movement
    );
    
    // Reset bow
    this.isDrawingBow = false;
    this.bowDrawPower = 0;
    this.bow.setScale(1, 1);
    
    // Check for game over when arrows run out
    if (this.arrowsRemaining <= 0) {
      this.time.delayedCall(1000, () => {
        this.gameOver();
      });
    }
  }

  fireArrowWithPower() {
    if (this.arrowInFlight) return;
    
    this.arrowInFlight = true;
    this.arrowsRemaining--;
    this.arrowsText.setText(`Arrows: ${this.arrowsRemaining}`);
    
    // Position arrow at archer
    this.arrow.setPosition(this.archer.x, this.archer.y - 40);
    this.arrow.setVisible(true);
    
    // Calculate arrow velocity based on bow power (keyboard)
    const power = this.bowDrawPower / this.maxBowPower;
    this.arrowVelocity = new Phaser.Math.Vector2(
      0, // No horizontal component for now
      -this.arrowSpeed * power // Negative Y for upward movement
    );
    
    // Reset bow
    this.isDrawingBow = false;
    this.bowDrawPower = 0;
    this.bow.setScale(1, 1);
    
    // Check for game over when arrows run out
    if (this.arrowsRemaining <= 0) {
      this.time.delayedCall(1000, () => {
        this.gameOver();
      });
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
