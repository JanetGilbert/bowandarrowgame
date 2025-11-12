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
      maxSize: 20,
      runChildUpdate: true
    });

    
    this.addBalls();

    this.physics.add.overlap(this.gameScene.archer.arrow, this.balls, this.hitBall, undefined, this);
    
    if (this.phase === 0) {
      // Phase 1: Only top and bottom bounds, balls wrap left/right
      this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);
      this.physics.world.setBoundsCollision(false, false, true, true); // left, right, up, down
    } else {
      // Other phases: Full world bounds
      this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);
    }

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
    if (this.phase === 0) {
      this.balls.children.entries.forEach((ball: any) => {
        if (ball.active) {
          this.physics.world.wrap(ball, 32);
        }
      });
    }
  }



  addBalls() {
    if (this.phase === 0){
     for (let i = 0; i < 20; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width);
        const y = Phaser.Math.Between(50, 400);
        const newBall = this.balls.create(x, y, 'ball');
        const overlapping = this.physics.overlap(newBall, this.balls);
        if (overlapping) {
          newBall.destroy(); // Remove and try again
          i--; // Decrement i to retry this iteration
        }
        else
        {
           // Set rightward direction only for phase 2
          const speed = 100;
          const angle = Phaser.Math.FloatBetween(-Math.PI/4, Math.PI/4); // Right direction range
          const velocityX = Math.cos(angle) * speed;
          const velocityY = Math.sin(angle) * speed;
          
          newBall.setVelocity(velocityX, velocityY)
                  .setBounce(1, 1)
                  .setCollideWorldBounds(true);
          
          // Apply gravity only to this ball
          if (newBall.body) {
            (newBall.body as Phaser.Physics.Arcade.Body).setGravityY(200);
          }
        }
      }
    }
    else if (this.phase === 1) {
 
      for (let i = 0; i < 15; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width);
        const y = Phaser.Math.Between(50, 400);
        const newBall = this.balls.create(x, y, 'ball');
        const overlapping = this.physics.overlap(newBall, this.balls);
        if (overlapping) {
          newBall.destroy(); // Remove and try again
          i--; // Decrement i to retry this iteration
        }
        else
        {
           // Set random direction
          const speed = 100;
          const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
          const velocityX = Math.cos(angle) * speed;
          const velocityY = Math.sin(angle) * speed;
          
          newBall.setVelocity(velocityX, velocityY)
                  .setBounce(1, 1)
                  .setCollideWorldBounds(true);
          
          // Apply gravity only to this ball
          if (newBall.body) {
            (newBall.body as Phaser.Physics.Arcade.Body).setGravityY(200);
          }
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
