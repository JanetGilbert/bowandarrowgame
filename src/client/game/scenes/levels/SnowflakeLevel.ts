import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Game } from '@scenes/Game.js';
import FloatScore from '@objects/floatscore.js';
import Snowflake from '@objects/snowflake.js';

export class SnowflakeLevel extends Scene {
  private snowflakes: Phaser.GameObjects.Group;
  private gameScene: Game;
  private phase: number;

  constructor() {
    super('SnowflakeLevel');
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
    
    this.snowflakes = this.add.group({
      classType: Snowflake,
      maxSize: 30,
      runChildUpdate: true
    });

    
    this.addSnowflakes();

    this.physics.add.overlap(this.gameScene.archer.arrow, this.snowflakes, this.hitSnowflake, undefined, this);
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

  }

  hitSnowflake(arrow: any, snowflake: any) {
    const scoreToAdd = Snowflake.score * arrow.multiplier;
    this.gameScene.floatScores.add(new FloatScore(this, snowflake.x, snowflake.y, scoreToAdd, 0xffffff));
    this.gameScene.addScore(scoreToAdd);
    snowflake.explode();
    arrow.multiplier += 10;
    this.gameScene.targetsRemaining = Math.max(0, this.gameScene.targetsRemaining - 1);
    this.gameScene.refreshUI();
  }

  
  override update() {

   
  }



  addSnowflakes() {

    if (this.phase === 0){
      for (let i = 0; i < this.snowflakes.maxSize; i++) {
        this.addRandomSnowflake();
      }
    }
    

  }

  addRandomSnowflake() : Snowflake | null {
    var overlapping = true;

    while (overlapping) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(50, 400);
      const newSnowflake = this.snowflakes.create(x, y, 'snowflake');
      newSnowflake.setVelocityX(Phaser.Math.FloatBetween(40, 60));
      overlapping = this.physics.overlap(newSnowflake, this.snowflakes);
      if (overlapping) {
        newSnowflake.destroy(); // Remove and try again
      }
      else{
        return newSnowflake;
      }
    }
    return null;

  }

  shutdown() {
    // Clean up snowflake group when leaving the scene
    if (this.snowflakes) {
      this.snowflakes.clear(true, true);
    }
  }
}
