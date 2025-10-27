export default class Snowflake extends Phaser.Physics.Arcade.Sprite {
  static readonly score = 2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'snowflake');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVelocityY(Phaser.Math.FloatBetween(-20, -25));

    // Scale randomly between half and full size
    const scale = Phaser.Math.FloatBetween(0.5, 1.0);
    this.setScale(scale);
    
    if (this.body) {
      const radius = 25;
      this.body.setCircle(radius);
      (this.body as Phaser.Physics.Arcade.Body).debugShowBody = true;
    }

    this.createAnimations();
  }

  override update() {
    this.handleMovement();
  }

  handleMovement() {
    if (this.active) {
      if (this.y < -this.height) {
        this.y = this.scene.scale.height + this.height;
      }
    }
  }

  explode() {
    this.scene.sound.play('pop2', { volume: 0.5 });


    this.scene.add.particles(this.x, this.y, 'snowflake_particles', {
      quantity: 20, 
      lifespan: 100,
      alpha: { start: 1, end: 0 },
      tint: this.tint,
      speed: { min: 600, max: 700 },
      emitting: false,
      frame: [0, 1, 2, 3, 4, 5],
      anim: 'snowflake_pop',
      rotate: { start: 0, end: 3600 }
    });

    this.destroy();
    
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
