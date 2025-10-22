import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { Game } from '@scenes/Game.js';
import FloatScore from '@objects/floatscore.js';
import Bubble from '@objects/bubble.js';

export class BubbleLevel extends Scene {
  private bubbles: Phaser.GameObjects.Group;
  private gameScene: Game;
  private phase: number;

  constructor() {
    super('BubbleLevel');
  }

  init(data: { phase?: number }) {
    this.phase = data.phase || 0;
  }

  preload() {

   }
 

  create() {
    // Get reference to Game scene
    this.gameScene = this.scene.get('Game') as Game;
    
    this.bubbles = this.add.group({
      classType: Bubble,
      maxSize: 30,
      runChildUpdate: true
    });

    
    this.addBubbles();

    this.physics.add.overlap(this.gameScene.archer.arrow, this.bubbles, this.hitBubble, undefined, this);
    this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

  }

  hitBubble(arrow: any, bubble: any) {
    const scoreToAdd = Bubble.score * arrow.multiplier;
    this.gameScene.floatScores.add(new FloatScore(this, bubble.x, bubble.y, scoreToAdd, bubble.tint));
    this.gameScene.addScore(scoreToAdd);
    bubble.explode();
    arrow.multiplier += 10;
    this.gameScene.targetsRemaining = Math.max(0, this.gameScene.targetsRemaining - 1);
    this.gameScene.refreshUI();
  }

  
  override update() {

    if (this.phase === 0){
      if (this.bubbles.children.size === 0) {
        this.addBubbles();
      }
    }
   
  }



  addBubbles() {

    if (this.phase === 0){
      for (let i = 0; i < this.bubbles.maxSize; i++) {
        const x = Phaser.Math.Between(0, this.cameras.main.width);
        const y = Phaser.Math.Between(50, 400);
        const newBubble = this.bubbles.create(x, y, 'bubble');
        newBubble.setVelocityX(Phaser.Math.FloatBetween(40, 60));
        const overlapping = this.physics.overlap(newBubble, this.bubbles);
        if (overlapping) {
          newBubble.destroy(); // Remove and try again
          i--; // Decrement i to retry this iteration
        }
      }
    }
  }

}
