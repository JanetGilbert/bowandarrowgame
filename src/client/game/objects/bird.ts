import { BirdLevel } from "@game/scenes/levels/BirdLevel";

export default class Bird extends Phaser.Physics.Arcade.Sprite {
  static readonly score = 3;
  private centerX: number;
  private centerY: number;
  private radius: number;
  private circleAngle: number;
  private angularSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bird');
    scene.add.existing(this);
    scene.physics.add.existing(this);
   
    // Initialize circular movement properties
    if ((this.scene as BirdLevel).phase == 1) {
      this.centerX = x;
      this.centerY = y;
      this.radius = Phaser.Math.Between(50, 150);
      this.circleAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.angularSpeed = Phaser.Math.FloatBetween(0.001, 0.003);
    }

    this.createAnimations(); 

    // Play animation 
    this.play('bird_fly');

    // Hit box
    if (this.body) {
      const hitBoxWidth = this.width * 0.8;
      const hitBoxHeight = this.height * 0.8;
      this.body.setSize(hitBoxWidth, hitBoxHeight);
      
      const offsetX = (this.width - hitBoxWidth) / 2;
      const offsetY = (this.height - hitBoxHeight) / 2;
      this.body.setOffset(offsetX, offsetY);
      
      (this.body as Phaser.Physics.Arcade.Body).debugShowBody = true;
    }
    
  }

  
  createAnimations() {
    if (!this.scene.anims.exists('bird_fly')) {
      this.scene.anims.create({
        key: 'bird_fly',
        frames: this.scene.anims.generateFrameNumbers('bird', { frames: [0, 1, 2] }),
        frameRate: 8,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  override update() {
    //   this.setVelocity(-50, 0);
    this.handleMovement();
  }

  handleMovement() {
    const phase = (this.scene as BirdLevel).phase;
    if (phase== 0) {
      // wrap using arcade physics wrap
      this.scene.physics.world.wrap(this, 25);
    }
    if (phase == 1) {
      // Update circle angle
      this.circleAngle += this.angularSpeed;
      
      // Calculate new position in circular path
      const newX = this.centerX + Math.cos(this.circleAngle) * this.radius;
      const newY = this.centerY + Math.sin(this.circleAngle) * this.radius;
      
      this.setPosition(newX, newY);
      
      // Calculate movement direction and face that way
      const velocityX = -Math.sin(this.circleAngle) * this.angularSpeed;
      const velocityY = Math.cos(this.circleAngle) * this.angularSpeed;
      
      // Set rotation to face movement direction
      this.setRotation(Math.atan2(velocityY, velocityX));
    }
  }

  explode() {
    const sfxVolume = this.scene.registry.get('sfxVolume');
    this.scene.sound.play('rustle', { volume: sfxVolume || 0.0 });

    this.scene.add.particles(this.x, this.y, 'paper_particles', {
      quantity: 20,
      lifespan: 1500,
      scale: { start: 0.5, end: 1 },
      alpha: { start: 1, end: 0 },
      tint: this.tint,
      speed: { min: 50, max: 100 },
      gravityY: 200,
      accelerationX: { min: -50, max: 50, random: [-20, 20] },
      emitting: false,
      frame: Phaser.Math.Between(0, 3),
      rotate: { start: Phaser.Math.Between(0, 180), end: 360 }
    }).explode();
    
    this.destroy();
  }
}
