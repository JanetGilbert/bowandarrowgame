export default class Balloon extends Phaser.Physics.Arcade.Sprite {
  private variance: number = 0.1;
  private oscillate: number = 0.002;
  static readonly score = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'balloon');
    this.variance = Phaser.Math.FloatBetween(0.01, 0.02);
    this.oscillate = Phaser.Math.FloatBetween(0.0005, 0.0007);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVelocityX(Phaser.Math.FloatBetween(50, 55));
    this.setTint(Phaser.Math.RND.pick([0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]));
    
    // Set smaller, centered circular body
    if (this.body) {
      this.body.setCircle(15); // Radius of 15 pixels
      this.body.setOffset(this.width / 2 - 15, this.height / 2 - 15); // Center the circle
      (this.body as Phaser.Physics.Arcade.Body).debugShowBody = true;
    }
  }

  override update() {
    this.handleMovement();
  }

  handleMovement() {
    if (this.active) {
      if (this.x > this.scene.scale.width + 50) {
        this.x = -50; 

      }
      this.y += Math.sin(this.scene.time.now * this.oscillate) * this.variance;
    }
  }

  explode() {
    const sfxVolume = this.scene.registry.get('sfxVolume');
    console.log('Playing pop sound with volume:', sfxVolume);
    this.scene.sound.play('pop', { volume: sfxVolume || 0.0 });

    this.scene.add.particles(this.x, this.y, 'balloon_particles', {
      quantity: 10, 
      lifespan: 200,
      scale: { start: 0.5, end: 1 },
      alpha: { start: 1, end: 0 },
      tint: this.tint,
      speed: { min: 300, max: 500 },
      emitting: false,
      frame: Phaser.Math.Between(0, 3),
      rotate: { start: Phaser.Math.Between(0, 180), end: 360 }
    }).explode();
    
    this.destroy();
  }
}
