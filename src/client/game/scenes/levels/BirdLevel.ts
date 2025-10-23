import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Game } from '@scenes/Game.js';
import Bird from '@objects/bird.js';
import FloatScore from '@objects/floatscore.js';

export class BirdLevel extends Scene {
  private birds: Phaser.GameObjects.Group;
  private gameScene: Game;
  private phase: number;

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
  }

  addRandomBalloon() {
    var overlapping = true;
    var tries = 0;
    do{
      const x = Phaser.Math.Between(-50, 0);
      const y = Phaser.Math.Between(50, 400);
      const newBird = this.birds.create(x, y, 'bird');
      newBird.setVelocityX(Phaser.Math.FloatBetween(40, 60));
      overlapping = this.physics.overlap(newBird, this.birds);
      if (overlapping) {
        newBird.destroy(); // Remove and try again
        tries++;
      }
    } while (overlapping && tries < 10);
  }

  shutdown() {
    // Clean up bird group when leaving the scene
    if (this.birds) {
      this.birds.clear(true, true);
    }
  }
}
