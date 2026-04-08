import * as Phaser from 'phaser';
import { PreviewBoot } from './game/scenes/PreviewBoot.js';
import { Preview } from './game/scenes/Preview.js';

document.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'preview-container',
    backgroundColor: '#000000',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 400,
      height: 320,
    },
    scene: [PreviewBoot, Preview],
  });
});
