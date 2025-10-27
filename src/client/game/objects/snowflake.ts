export default class Snowflake extends Phaser.Physics.Arcade.Sprite {
  static readonly score = 2;
  private rotationSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'snowflake');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVelocityX(Phaser.Math.FloatBetween(-20, 20));
    this.setVelocityY(Phaser.Math.FloatBetween(40, 80));
    this.rotationSpeed = Phaser.Math.FloatBetween(-0.02, 0.02);

    // Scale randomly between half and full size
    const scale = Phaser.Math.FloatBetween(0.5, 1.0);
    this.setScale(scale);
    
    // Start continuous rotation from random angle
    this.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
    
    if (this.body) {
      const radius = 25;
      this.body.setCircle(radius);
      (this.body as Phaser.Physics.Arcade.Body).debugShowBody = true;
    }

    this.createAnimations();
  }

  override update() {
    this.handleMovement();
    
    // Continuous rotation (frame-rate independent)
    this.rotation += this.rotationSpeed * this.scene.game.loop.delta / 16.67; // Normalized to 60fps
  }

  handleMovement() {
    
  }

  explode(multiplier: number = 1) {
    this.scene.sound.play('glass', { 
      volume: 0.5,
      rate: 1.0 + multiplier / 100
    });

    if (this.body) {
      this.body.enable = false;
    }

    this.scene.add.particles(this.x, this.y, 'snowflake_particles', {
      quantity: 20, 
      lifespan: 1000,
      scale: { min: 1, max: 2 },
      alpha: { start: 1, end: 0 },
      tint: 0xffffff, // White tint for snowflake particles
      speed: { min: 20, max: 50 },
      gravityY: 300,
      emitting: false,
      frame: [0,1,2,3,4,5],
      anim: 'snowflake_pop',
    }).explode();

    this.scene.tweens.add({
      targets: this,  
      alpha: 0,
      duration: 600,
      onComplete: () => {
        this.destroy();
      }
    });
    
  }


  createAnimations() {
    if (!this.scene.anims.exists('snowflake_pop')) {
      this.scene.anims.create({
        key: 'snowflake_pop',
        frames: this.scene.anims.generateFrameNumbers('snowflake_particles', { start: 0, end: 5 }),
        frameRate: 20,
        yoyo: false,
        repeat: -1,
      });
    }
  }
}
