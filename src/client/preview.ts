import * as Phaser from 'phaser';
import { PreviewBoot } from './game/scenes/PreviewBoot.js';
import { Preview } from './game/scenes/Preview.js';

document.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'preview-container',
    backgroundColor: '#000000',
    input: {
      mouse: {
        preventDefaultWheel: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: '100%',
      height: '100%',
    },
    scene: [PreviewBoot, Preview],
  });
});
