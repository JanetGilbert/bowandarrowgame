import Arrow from '../objects/arrow.js';

export default class Archer extends Phaser.GameObjects.Sprite {

  isDragging: boolean = false;
  dragStartX: number = 0;
  archerStartX: number = 0;

  arrow: Arrow;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'archer');
    scene.add.existing(this);

    this.createAnimations();
    this.setupInput();
    this.anims.play('idle');
    this.setInteractive();
    this.arrow = new Arrow(this.scene);
  }

  createAnimations() {
    if (!this.scene.anims.exists('walk_left')) {
      this.scene.anims.create({
        key: 'walk_left',
        frames: this.scene.anims.generateFrameNumbers('archer', { start: 16, end: 31 } ),
        frameRate: 8,
        repeat: -1
      });
    }

    if (!this.scene.anims.exists('walk_right')) {
      this.scene.anims.create({
        key: 'walk_right',
        frames: this.scene.anims.generateFrameNumbers('archer', { start: 32, end: 47 } ),
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
        this.fireBow();
      }
    });

   this.scene.input.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.isDragging = false;
        console.log('Pointer released outside the game canvas');
      }
    });

    document.addEventListener('mouseleave', (event) => {
      console.log('mouse leave');
      this.isDragging = false;
    });
  }



  fireBow() {
    this.arrow.fireArrow(this.x, this.y - 20);
  }

  override update() {
    // Player-specific update logic
    this.handleMovement();
    this.arrow.update();
  }

  handleMovement() {
    // Movement logic here (if any additional movement is needed)
  }
}
