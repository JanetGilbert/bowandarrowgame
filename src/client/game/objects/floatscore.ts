export default class FloatScore extends Phaser.GameObjects.BitmapText {

  constructor(scene: Phaser.Scene, x: number, y: number, score: number, tint: number) {
    super(scene, x, y, 'moghul_white', `+${score}`, 24);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set the origin to center the text
    this.setOrigin(0.5);
    
    // Set initial velocity to float upward
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-100);
    
    this.setTintFill(tint);
  }

  override update() {
    this.handleMovement();
  }


  handleMovement() {
    if (this.active) {
      if (this.y < 0) {
        this.setActive(false);
        this.destroy();
      }
    }
  }
}
