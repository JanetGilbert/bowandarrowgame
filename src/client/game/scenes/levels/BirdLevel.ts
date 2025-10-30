import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Game } from '@scenes/Game.js';
import Bird from '@objects/bird.js';
import FloatScore from '@objects/floatscore.js';

export class BirdLevel extends Scene {
  private birds: Phaser.GameObjects.Group;
  private gameScene: Game;
  public phase: number;

  constructor() {
    super('BirdLevel');
  }

  init(data: { phase?: number }) {
    this.phase = data.phase || 0;
  }

  preload() {

   }
 

  create() {
    if (Game.DEBUGGING){
      this.physics.world.createDebugGraphic();
    }
    

    this.gameScene = this.scene.get('Game') as Game;
    
    this.birds = this.add.group({
      classType: Bird,
      maxSize: 40,
      runChildUpdate: true
    });

    
    this.addBirds();

    if (this.phase === 1){
      this.time.addEvent({
        delay: 200,
        callback: this.addDivingBird,
        callbackScope: this,
        loop: true
      });
    }


    this.physics.add.overlap(this.gameScene.archer.arrow, this.birds, this.hitBird, undefined, this);
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

  }

  hitBird(arrow: any, bird: any) {
    const scoreToAdd = Bird.score * arrow.multiplier;
    this.gameScene.floatScores.add(new FloatScore(this, bird.x, bird.y, scoreToAdd, bird.tint));
    this.gameScene.addScore(scoreToAdd);
    bird.explode();
    arrow.multiplier += 10;
    this.gameScene.targetsRemaining = Math.max(0, this.gameScene.targetsRemaining - 1);
    this.gameScene.refreshUI();
  }

  
  override update() {

    if (this.phase === 0){
      if (this.birds.children.size === 0) {
        this.addBirds();
      }
    }
   
  }



  addBirds() {
    if (this.phase === 0){
      for (let i = 0; i < 30; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width);
        const y = Phaser.Math.Between(50, 400);
        const newBird = this.birds.create(x, y, 'bird');
        
        // Flip direction randomly
        const speed = Phaser.Math.FloatBetween(50, 70);
        if (Phaser.Math.Between(0, 1) === 0) {
          newBird.setFlipX(true); 
          newBird.setVelocityX(-speed);
        } else {
          newBird.setVelocityX(speed);
        }

        // Check for overlap with existing birds
        const overlapping = this.physics.overlap(newBird, this.birds);
        if (overlapping) {
          newBird.destroy(); // Remove and try again
          i--; // Decrement i to retry this iteration
        }

      }
    }
    else{ 
      for (let i = 0; i < 10; i++) {
        this.addDivingBird();
      }
    }
  }

  addDivingBird() {
    var overlapping = true;
    var tries = 0;  

    if (this.birds.children.size >= this.birds.maxSize) {
      return; 
    }

    while (overlapping && tries < 10) {
      const x = Phaser.Math.Between(-200, this.cameras.main.width + 200);
      const y = Phaser.Math.Between(0, -100);
      const newBird = this.birds.create(x, y, 'bird');
      newBird.setVelocityX(Phaser.Math.Between(20, 40));
      newBird.setVelocityY(Phaser.Math.Between(75, 125));

      if (newBird.x > this.cameras.main.width / 2) {
        newBird.setFlipX(true); 
        newBird.setVelocityX(-newBird.body.velocity.x);
      }

      // Check for overlap with existing birds
      const overlapping = this.physics.overlap(newBird, this.birds);
      if (overlapping) {
        newBird.destroy(); // Remove and try again
        tries++;
      }
      else{
        return;
      }
    }
  }

  shutdown() {
    // Clean up bird group when leaving the scene
    if (this.birds) {
      this.birds.clear(true, true);
    }
  }
}
