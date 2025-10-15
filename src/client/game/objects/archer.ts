export default class Player extends Phaser.GameObjects.Sprite {
  // Touch/Mouse controls
  isDragging: boolean = false;
  dragStartX: number = 0;
  archerStartX: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'archer');
    scene.add.existing(this);
    
    // Create animations for this archer
    this.createAnimations();
    
    // Set up input handling for this archer
    this.setupInput();

    this.anims.play('idle');

      // Listen to the browser window for pointer releases outside the canvas
    /*document.addEventListener('mouseup', function(event) {
        console.log('Mouse button released, even outside the window!');
    });*/
  }

  private range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  createAnimations() {
    // Only create animations if they don't already exist
    if (!this.scene.anims.exists('walk_left')) {
      this.scene.anims.create({
        key: 'walk_left',
        frames: this.scene.anims.generateFrameNumbers('archer', { frames: this.range(16, 31) }),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('walk_right')) {
      this.scene.anims.create({
        key: 'walk_right',
        frames: this.scene.anims.generateFrameNumbers('archer', { frames: this.range(32, 47) }),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('idle')) {
      this.scene.anims.create({
        key: 'idle',
        frames: this.scene.anims.generateFrameNumbers('archer', { frames: [48, 49] }),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('draw')) {
      this.scene.anims.create({
        key: 'draw',
        frames: this.scene.anims.generateFrameNumbers('archer', { frames: [63, 62, 61, 60] }),
        frameRate: 8,
        repeat: -1
      });
    }
  }

  setupInput() {
    // Make this sprite interactive
    this.setInteractive();
    
    // Set up scene-level input for drag controls
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.archerStartX = this.x;
    });
    
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const deltaX = pointer.x - this.dragStartX;
        const newX = this.archerStartX + deltaX;
        
        // Keep archer within fixed portrait bounds
        const clampedX = Phaser.Math.Clamp(newX, 50, 350);
        this.x = clampedX;
      }
    });
    
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.onDragEnd();
      }
    });

   this.scene.input.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.isDragging = false;
        console.log('Pointer released outside the game canvas');
      }
    });


    this.scene.input.on('gameout', (pointer: Phaser.Input.Pointer) => {
      console.log('Game out');
    });

    document.addEventListener('mouseleave', (event) => {
      console.log('mouse leave');
      this.isDragging = false;
    });
  }



  onDragEnd() {
    // Override this method in the game scene if needed
    // or emit an event that the game scene can listen to
  }

  override update() {
    // Player-specific update logic
    this.handleMovement();
  }

  handleMovement() {
    // Movement logic here (if any additional movement is needed)
  }
}
