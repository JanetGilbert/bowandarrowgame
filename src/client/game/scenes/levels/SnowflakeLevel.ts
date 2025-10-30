import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Game } from '@scenes/Game.js';
import FloatScore from '@objects/floatscore.js';
import Snowflake from '@objects/snowflake.js';

export class SnowflakeLevel extends Scene {
  private snowflakes: Phaser.GameObjects.Group;
  private gameScene: Game;
  public phase: number;

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

    if (this.phase === 0){
      this.time.addEvent({
        delay: 200,
        callback: this.addRandomSnowflake,
        callbackScope: this,
        loop: true
      });
    }


    this.physics.add.overlap(this.gameScene.archer.arrow, this.snowflakes, this.hitSnowflake, undefined, this);
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

  }

  hitSnowflake(arrow: any, snowflake: any) {
    const scoreToAdd = Snowflake.score * arrow.multiplier;
    this.gameScene.floatScores.add(new FloatScore(this, snowflake.x, snowflake.y, scoreToAdd, 0xffffff));
    this.gameScene.addScore(scoreToAdd);
    const sfxVolume = this.registry.get('sfxVolume');
    this.sound.play('glass', { 
      volume: sfxVolume || 0.0,
      rate: 1.0 + (arrow.multiplier / 100)
    });

    snowflake.explode();
    arrow.multiplier += 10;
    this.gameScene.targetsRemaining = Math.max(0, this.gameScene.targetsRemaining - 1);
    this.gameScene.refreshUI();
  }

  
  override update() 
  {
    // Destroy snowflakes that go off the bottom of the screen
    if (this.phase === 0) {
      this.snowflakes.children.entries.forEach((snowflake: any) => {
        if (snowflake.active && snowflake.y > this.cameras.main.height) {
          snowflake.destroy();
        }
      });
    }
    else {
      this.snowflakes.children.entries.forEach((snowflake: any) => {
        if (snowflake.active) {
          this.physics.world.wrap(snowflake, 32);
        }
      });
    } 
  }


  addSnowflakes() {

    if (this.phase === 0){
      for (let i = 0; i < this.snowflakes.maxSize; i++) {
        const y = Phaser.Math.Between(50, 400);
        this.addRandomSnowflake(y);
      }
    }
    else {
      for (let i = 0; i < 20; i++) {
        this.addSwirlingSnowflake();
      }
    }
  }

  addSwirlingSnowflake() {
    var overlapping = true;
    var tries = 0;

    while (overlapping && tries < 10  ) {
      tries++;
      const x = Phaser.Math.Between(0, this.cameras.main.width);
      const y = Phaser.Math.Between(50, 400);

      const newSnowflake = this.snowflakes.create(x, y, 'snowflake');

      if (newSnowflake==null){
        return null;
      }

      newSnowflake.setPhase(this.phase);

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

  addRandomSnowflake(y: number = -50) : Snowflake | null {
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
          newSnowflake.setVelocityX(Phaser.Math.FloatBetween(-20, 20));
          newSnowflake.setVelocityY(Phaser.Math.FloatBetween(40, 80));
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
