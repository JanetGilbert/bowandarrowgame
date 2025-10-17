import Arrow from '../objects/arrow.js';

enum ArcherState {
  Idle,
  MoveLeft,
  MoveRight,
  DrawingBow,
}

export default class Archer extends Phaser.GameObjects.Sprite {

  isDragging: boolean = false;
  dragStartX: number = 0;
  archerStartX: number = 0;
  lastMovedTime: number = 0;
  currentState: ArcherState = ArcherState.Idle;
  arrow: Arrow;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'archer');
    scene.add.existing(this);

    this.createAnimations();
    this.setupInput();
    this.anims.play('idle');
    this.setInteractive();
    this.arrow = new Arrow(this.scene);
    this.lastMovedTime = this.scene.time.now;
  }

  createAnimations() {
    if (!this.scene.anims.exists('walk_left')) {
      this.scene.anims.create({
        key: 'walk_left',
        frames: this.scene.anims.generateFrameNumbers('archer', { frames: [22, 23, 24] }),
        frameRate: 8,
        yoyo: true,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists('walk_right')) {
      this.scene.anims.create({
        key: 'walk_right',
        frames: this.scene.anims.generateFrameNumbers('archer', { frames: [37, 38, 39] }),
        frameRate: 8,
        yoyo: true,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists('idle')) {
      this.scene.anims.create({
        key: 'idle',
        frames: this.scene.anims.generateFrameNumbers('archer', { frames: [50] }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!this.scene.anims.exists('draw')) {
      this.scene.anims.create({
        key: 'draw',
        frames: this.scene.anims.generateFrameNumbers('archer', { frames: [59, 60, 61] }),
        frameRate: 8,
        repeat: 0
      });
    }

    if (!this.scene.anims.exists('drawn')) {
      this.scene.anims.create({
        key: 'drawn',
        frames: this.scene.anims.generateFrameNumbers('archer', { frames: [61] }),
        frameRate: 8,
        repeat: 0
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
      this.setArcherState(ArcherState.DrawingBow);
    });
    
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {

      if (this.isDragging) {
        const deltaX = pointer.x - this.dragStartX;
        const newX = this.archerStartX + deltaX;
        
        // Keep archer within fixed portrait bounds
        const clampedX = Phaser.Math.Clamp(newX, 50, 350);
        
        // Play walking animation based on movement direction
        const diffX = Math.abs(clampedX - this.x);
        if (clampedX < this.x && diffX > 1) {
          this.setArcherState(ArcherState.MoveLeft);
        } else if (clampedX > this.x && diffX > 1) {
          this.setArcherState(ArcherState.MoveRight);
        }
        
        this.x = clampedX;
        if (diffX > 1){
          this.lastMovedTime = this.scene.time.now;
        }
      }
    });
    
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.isDragging = false;
        this.fireBow();
        this.setArcherState(ArcherState.Idle);
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

  setArcherState(newState: ArcherState) {
    if (this.currentState !== newState) {
      const oldState = this.currentState;
      console.log('State change:', ArcherState[this.currentState], '->', ArcherState[newState]);
      this.currentState = newState; 
      switch (newState) {
        case ArcherState.Idle:
          this.anims.play('idle', true);
          break;
        case ArcherState.MoveLeft:
          this.anims.play('walk_left', true);
          break;
        case ArcherState.MoveRight:
          this.anims.play('walk_right', true);
          break;
        case ArcherState.DrawingBow:
          if (oldState == ArcherState.Idle) {
            this.anims.play('draw', true);
          } else {
            this.anims.play('drawn', true);
          }
          break;
      }
    }
  }

  fireBow() {
    this.arrow.fireArrow(this.x, this.y - 20);

  }

  override update() {
    this.handleMovement();
    this.arrow.update();
  }

  handleMovement() {
    if ((this.currentState==ArcherState.MoveLeft || this.currentState==ArcherState.MoveRight) && (this.scene.time.now - this.lastMovedTime) > 200) {
      if(this.isDragging) {
        this.setArcherState(ArcherState.DrawingBow);
      }
      else {
        this.setArcherState(ArcherState.Idle);
      }
    }
  }
}
