import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { LevelUp } from './scenes/LevelUp';
import { MainMenu } from './scenes/MainMenu';
import * as Phaser from 'phaser';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { BalloonLevel } from './scenes/levels/BalloonLevel';
import { BubbleLevel } from './scenes/levels/BubbleLevel';
import { BirdLevel } from './scenes/levels/BirdLevel';
import { BallLevel } from './scenes/levels/BallLevel';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: 'game-container',
  backgroundColor: '#000000', // Black background for borders
  physics: {
      default: 'arcade'
  },
  scale: {
    // Force portrait orientation with black borders
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 400, // Portrait width
    height: 600, // Portrait height (3:2 ratio)
    min: {
      width: 400,
      height: 600
    },
    max: {
      width: 400,
      height: 600
    }
  },
  scene: [Boot, Preloader, MainMenu, MainGame, LevelUp, GameOver, BalloonLevel, BubbleLevel, BirdLevel, BallLevel],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
