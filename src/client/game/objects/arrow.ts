export default class Arrow extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene) {
    super(scene, 100, 800, 'arrow');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body?.setSize(3, 20);

    this.setActive(false).setVisible(false);
  }

  override update() {
    this.handleMovement();
  }

  fireArrow(x: number, y: number) {
    if (!this.active) {
      this.setPosition(x, y);
      this.setActive(true);
      this.setVisible(true);
      this.setVelocityY(-400);
    }
  }

  handleMovement() {
    if (this.active) {
      if (this.y < 0) {
        this.setActive(false);
      }
    }
  }
}
