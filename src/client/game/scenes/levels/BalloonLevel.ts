import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Game } from '@scenes/Game.js';
import Balloon from '@objects/balloon.js';
import FloatScore from '@objects/floatscore.js';

export class BalloonLevel extends Scene {
  private balloons: Phaser.GameObjects.Group;
  private gameScene: Game;

  constructor() {
    super('BalloonLevel');
  }

  init() {

  }

  preload() {

   }
 

  create() {
    // Get reference to Game scene
    this.gameScene = this.scene.get('Game') as Game;
    
    this.balloons = this.add.group({
      classType: Balloon,
      maxSize: 10,
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
    if (this.balloons.children.size === 0) {
      this.addBalloons();
    }
  }



  addBalloons() {
    this.balloons.createMultiple({ key: 'balloon', quantity: 7, setXY: { x: 0, y: 50, stepX: 0, stepY: 50 }   });
  }

}
