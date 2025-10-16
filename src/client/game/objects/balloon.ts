export default class Balloon extends Phaser.Physics.Arcade.Sprite {
  variance: number = 0.1;
  oscillate: number = 0.002;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'balloon');
    this.variance = Phaser.Math.FloatBetween(0.03, 0.05);
    this.oscillate = Phaser.Math.FloatBetween(0.001, 0.002);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVelocityX(Phaser.Math.FloatBetween(50, 55));
    this.setActive(false);
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
}
