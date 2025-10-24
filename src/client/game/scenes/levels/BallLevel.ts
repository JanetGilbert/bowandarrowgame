import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Game } from '@scenes/Game.js';
import Ball from '@objects/ball.js';
import FloatScore from '@objects/floatscore.js';

export class BallLevel extends Scene {
  private balls: Phaser.GameObjects.Group;
  private gameScene: Game;
  private phase: number;

  constructor() {
    super('BallLevel');
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

    this.balls = this.add.group({
      classType: Ball,
      maxSize: 15,
      runChildUpdate: true
    });

    
    this.addBalls();

    this.physics.add.overlap(this.gameScene.archer.arrow, this.balls, this.hitBall, undefined, this);
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

  }

  hitBall(arrow: any, ball: any) {
    const scoreToAdd = Ball.score * arrow.multiplier;
    this.gameScene.floatScores.add(new FloatScore(this, ball.x, ball.y, scoreToAdd, ball.getScoreTint()));
    this.gameScene.addScore(scoreToAdd);
    ball.explode();
    arrow.multiplier += 10;
    this.gameScene.targetsRemaining = Math.max(0, this.gameScene.targetsRemaining - 1);
    this.gameScene.refreshUI();
  }

  
  override update() {


   
  }



  addBalls() {
    if (this.phase === 0){

      for (let i = 0; i < 15; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width);
        const y = Phaser.Math.Between(50, 400);
        const newBall = this.balls.create(x, y, 'ball');
        const overlapping = this.physics.overlap(newBall, this.balls);
        if (overlapping) {
          newBall.destroy(); // Remove and try again
          i--; // Decrement i to retry this iteration
        }
      }
    }
  }

  

  shutdown() {
    // Clean up balloon group when leaving the scene
    if (this.balls) {
      this.balls.clear(true, true);
    }
  }
}
