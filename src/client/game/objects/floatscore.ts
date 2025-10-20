export default class FloatScore extends Phaser.GameObjects.BitmapText {

  constructor(scene: Phaser.Scene, x: number, y: number, score: number, tint: number) {
    super(scene, x, y, 'moghul_white', `+${score}`, 24);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setOrigin(0.5); // Set the origin to center the text
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-100);
    this.setTint(tint);
    
    // Start fade out animation
    scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0 },
      duration: 500, 
      ease: 'Linear',
      onComplete: () => {
        this.setActive(false);
        this.destroy();
      }
    });
  }


}
