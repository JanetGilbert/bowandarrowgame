export default class Bird extends Phaser.Physics.Arcade.Sprite {
  static readonly score = 3;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bird');
    scene.add.existing(this);
    scene.physics.add.existing(this);
   
    this.createAnimations(); 

    // Play animation 
    this.play('bird_fly');

    // Hit box
    if (this.body) {
      const hitBoxWidth = this.width * 0.8;
      const hitBoxHeight = this.height * 0.8;
      this.body.setSize(hitBoxWidth, hitBoxHeight);
      
      const offsetX = (this.width - hitBoxWidth) / 2;
      const offsetY = (this.height - hitBoxHeight) / 2;
      this.body.setOffset(offsetX, offsetY);
      
      (this.body as Phaser.Physics.Arcade.Body).debugShowBody = true;
    }
    


    this.setActive(false);
  }

  
  createAnimations() {
    if (!this.scene.anims.exists('bird_fly')) {
      this.scene.anims.create({
        key: 'bird_fly',
        frames: this.scene.anims.generateFrameNumbers('bird', { frames: [0, 1, 2] }),
        frameRate: 8,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  override update() {
    //   this.setVelocity(-50, 0);
    this.handleMovement();
  }

  handleMovement() {
    if (this.active && this.body) {
      this.scene.physics.world.wrap(this, 32);
    }
  }

  explode() {
    this.scene.sound.play('rustle', { volume: 0.5 });

    this.scene.add.particles(this.x, this.y, 'paper_particles', {
      quantity: 20,
      lifespan: 1500,
      scale: { start: 0.5, end: 1 },
      alpha: { start: 1, end: 0 },
      tint: this.tint,
      speed: { min: 50, max: 100 },
      gravityY: 200,
      accelerationX: { min: -50, max: 50, random: [-20, 20] },
      emitting: false,
      frame: Phaser.Math.Between(0, 3),
      rotate: { start: Phaser.Math.Between(0, 180), end: 360 }
    }).explode();
    
    this.destroy();
  }
}
