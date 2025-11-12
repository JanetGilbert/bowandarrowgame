
export default class Snowflake extends Phaser.Physics.Arcade.Sprite {
  static readonly score = 2;
  private swirlingRotation: number = 0;
  private swirlingSpeed: number = 0;
  private phase: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'snowflake');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.swirlingRotation = Phaser.Math.FloatBetween(-50, 50);
    this.swirlingSpeed = Phaser.Math.FloatBetween(10, 40);
    // Reverse speed on coin flip
    if (Phaser.Math.Between(0, 1) === 0) {
      this.swirlingSpeed = -this.swirlingSpeed;
    }

    // Scale randomly between half and full size
    const scale = Phaser.Math.FloatBetween(0.5, 1.0);
    this.setScale(scale);
    
    // Start continuous rotation from random angle
    this.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
    
    if (this.body) {
      this.setAngularVelocity(Phaser.Math.FloatBetween(-50, 50));
      const radius = 25;
      this.body.setCircle(radius);
      (this.body as Phaser.Physics.Arcade.Body).debugShowBody = true;
    }

    this.createAnimations();
  }

  setPhase(phase: number) {
    this.phase = phase;
  }

  override update() {
    this.handleMovement();
  }

  handleMovement() {
    if (this.phase === 1) {
      this.swirlingRotation += 0.0005 * this.scene.game.loop.delta;
      if (this.swirlingRotation > Math.PI * 2) {
        this.swirlingRotation = this.swirlingRotation - (Math.PI * 2);
      }

      if (this.body) {
        this.scene.physics.velocityFromRotation(this.swirlingRotation, this.swirlingSpeed, this.body.velocity);
      } 
    }
  }

  explode() {


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
