export default class Bubble extends Phaser.Physics.Arcade.Sprite {
  private variance: number;
  private oscillate: number;
  private centerX: number;
  static readonly score = 2;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bubble');
    this.variance = Phaser.Math.FloatBetween(30, 50);
    this.oscillate = Phaser.Math.FloatBetween(0.0001, 0.0005);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setVelocityY(Phaser.Math.FloatBetween(-20, -25));
    this.setTint(Phaser.Math.Between(0x000000, 0xffffff));
    
    if (this.body) {
      const radius = 20;
      this.body.setCircle(radius);
      this.body.setOffset(this.width / 2 - radius, this.height / 2 - radius);
      (this.body as Phaser.Physics.Arcade.Body).debugShowBody = true;
    }
    
    this.centerX = x;
    this.setActive(false);

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
      this.x = this.centerX + Math.sin(this.scene.time.now * this.oscillate) * this.variance;
    }
  }

  explode() {
    this.scene.sound.play('pop', { volume: 0.5 });
    
    // Play bubble pop animation, then destroy when complete
    this.play('bubble_pop');
    if (this.body) {
      this.body.enable = false;
      console.log('Bubble body removed from physics world');
    }
    this.on('animationcomplete', () => {
      this.destroy();
    });
  }


  createAnimations() {
    if (!this.scene.anims.exists('bubble_pop')) {
      this.scene.anims.create({
        key: 'bubble_pop',
        frames: this.scene.anims.generateFrameNumbers('bubble', { start: 0, end: 9 }),
        frameRate: 60,
        yoyo: false,
        repeat: 0,
      });
    }
  }
}
