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
      maxSize: 40,
      runChildUpdate: true
    });

    
    this.addSnowflakes();

    this.time.addEvent({
      delay: Phaser.Math.Between(100, 400),
      callback: this.addRandomSnowflake,
      callbackScope: this,
      loop: true
    });

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

  
  override update() 
  {
    // Destroy snowflakes that go off the bottom of the screen
    this.snowflakes.children.entries.forEach((snowflake: any) => {
      if (snowflake.active && snowflake.y > this.cameras.main.height + 50) {
        snowflake.destroy();
      }
    });
  }



  addSnowflakes() {

    if (this.phase === 0){
      for (let i = 0; i < this.snowflakes.maxSize; i++) {
        const y = Phaser.Math.Between(50, 400);
        this.addRandomSnowflake(y);
      }
    }
    

  }

  addRandomSnowflake(y: number) : Snowflake | null {
    var overlapping = true;
    var tries = 0;

    while (overlapping && tries < 10  ) {
      const x = Phaser.Math.Between(0, this.cameras.main.width);  
      const newSnowflake = this.snowflakes.create(x, y, 'snowflake');
      if (newSnowflake==null){
        return null;
      }
      overlapping = this.physics.overlap(newSnowflake, this.snowflakes);
      tries++;
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
    console.log('Shutting down SnowflakeLevel');
    // Clean up snowflake group when leaving the scene
    if (this.snowflakes) {
      this.snowflakes.clear(true, true);
    }
  }
}
