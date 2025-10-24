export default class Ball extends Phaser.Physics.Arcade.Sprite {
  static readonly score = 4;
  private frameNumber: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'balls');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set random frame
    this.frameNumber = Phaser.Math.Between(0, 6);
    this.setFrame(this.frameNumber);

    // Set smaller, centered circular body
    if (this.body) {
      this.body.setCircle(30); // Radius of 30 pixels
      this.body.setOffset(32 - 30, 32 - 30); // Center the circle on 64x64 sprite
      (this.body as Phaser.Physics.Arcade.Body).debugShowBody = true;

                 
    }

    var scale = 1;
    switch (this.frameNumber) {
      case 0: scale = 0.4; break;
      case 1: scale = 0.7; break;
      case 2: scale = 0.8; break;
      case 3: scale = 1.0; break;
      case 4: scale = 0.5; break;
      case 5: scale = 0.8; break;
      case 6: scale = 0.4; break;
    }
    this.setScale(scale);

    // Set random direction
    const speed = 100;
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    
    this.setVelocity(velocityX, velocityY)
            .setBounce(1, 1)
            .setCollideWorldBounds(true);
    
    // Apply gravity only to this ball
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setGravityY(200);
    }

    // Get the current frame number
    console.log('Ball frame:', this.frame.name);
    
    this.setActive(false);
  }

  override update() {
    this.handleMovement();
  }

  handleMovement() {
    if (this.body) {
        this.rotation = this.angle;
    }
  }

  getScoreTint(): number {

    switch (this.frameNumber) {
      case 0: return 0xCDFF21; // Yellow
      case 1: return 0x408FD7; // Blue
      case 2: return 0xAAAAAA; // Grey
      case 3: return 0xF68D22; // Orange
      case 4: return 0xFFFFFF; // White 
      case 5: return 0x3177c7; // Blue
      case 6: return 0xffffff; // White
    }
    return 0xffffff;
  }

  explode() {
    this.scene.sound.play('pop', { volume: 0.5 });
    if (this.body) {
      this.body.enable = false;
    }
    // Scale ball to zero over 200ms then destroy
    this.scene.tweens.add({
      targets: this,  
      scaleX: 0,
      scaleY: 0,
      duration: 200,
      onComplete: () => {
        this.destroy();
      }
    });
  }
}
