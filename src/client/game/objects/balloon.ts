export default class Balloon extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'balloon');
    scene.add.existing(this);
    scene.physics.add.existing(this);
   this.setVelocityX(50);
    this.setActive(false);
  }

  override update() {
    this.handleMovement();
  }

  handleMovement() {
    if (this.active) {
      if (this.x > this.scene.scale.width + 50) {
        //this.setActive(false);
        this.x = -50; // Reset position to the left side
      }
    }
  }
}
