export default class Player extends Phaser.GameObjects.Sprite {
  // Touch/Mouse controls
  isDragging: boolean = false;
  dragStartX: number = 0;
  archerStartX: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'archer');
    scene.add.existing(this);
    
    // Set up input handling for this archer
    this.setupInput();

    this.anims.play('idle');
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

   this.scene.input.on('gameout', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.isDragging = false;
      }
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
