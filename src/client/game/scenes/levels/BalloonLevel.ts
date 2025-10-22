import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Game } from '@scenes/Game.js';
import Balloon from '@objects/balloon.js';
import FloatScore from '@objects/floatscore.js';

export class BalloonLevel extends Scene {
  private balloons: Phaser.GameObjects.Group;
  private gameScene: Game;
  private phase: number;

  constructor() {
    super('BalloonLevel');
  }

  init(data: { phase?: number }) {
    this.phase = data.phase || 0;
  }

  preload() {

   }
 

  create() {
    // Get reference to Game scene
    this.gameScene = this.scene.get('Game') as Game;
    
    this.balloons = this.add.group({
      classType: Balloon,
      maxSize: 20,
      runChildUpdate: true
    });

    
    this.addBalloons();

    this.physics.add.overlap(this.gameScene.archer.arrow, this.balloons, this.hitBalloon, undefined, this);
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

  }

  hitBalloon(arrow: any, balloon: any) {
    const scoreToAdd = Balloon.score * arrow.multiplier;
    this.gameScene.floatScores.add(new FloatScore(this, balloon.x, balloon.y, scoreToAdd, balloon.tint));
    this.gameScene.addScore(scoreToAdd);
    balloon.explode();
    arrow.multiplier += 10;
    this.gameScene.targetsRemaining = Math.max(0, this.gameScene.targetsRemaining - 1);
    this.gameScene.refreshUI();
  }

  
  override update() {

    if (this.phase === 0){
      if (this.balloons.children.size === 0) {
        this.addBalloons();
      }
    }
    else{
      if (this.balloons.children.size < 20) {
        this.addRandomBalloon();
      }
    }
  }



  addBalloons() {
    console.log("phase" +this.phase);
    if (this.phase === 0){
      this.balloons.createMultiple({ key: 'balloon', quantity: 7, setXY: { x: 0, y: 50, stepX: 0, stepY: 50 }   });
    }
    else{
      for (let i = 0; i < 20; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width);
        const y = Phaser.Math.Between(50, 400);
        const newBalloon = this.balloons.create(x, y, 'balloon');
        newBalloon.setVelocityX(Phaser.Math.FloatBetween(40, 60));
        const overlapping = this.physics.overlap(newBalloon, this.balloons);
        if (overlapping) {
          console.log("overlap detected");
          newBalloon.destroy(); // Remove and try again
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
      const newBalloon = this.balloons.create(x, y, 'balloon');
      newBalloon.setVelocityX(Phaser.Math.FloatBetween(40, 60));
      overlapping = this.physics.overlap(newBalloon, this.balloons);
      if (overlapping) {
        newBalloon.destroy(); // Remove and try again
        tries++;
      }
    } while (overlapping && tries < 10);
  }

}
