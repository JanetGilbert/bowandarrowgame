import { Scene } from 'phaser';
import type { HighScoreEntry } from '../../../shared/types/api.js';

interface PreviewBalloon {
  image: Phaser.GameObjects.Image;
  speed: number;
  variance: number;
  oscillate: number;
}

export class Preview extends Scene {
  private balloons: PreviewBalloon[] = [];
  private username: string = '';
  private scores: HighScoreEntry[] = [];

  private welcomeText: Phaser.GameObjects.BitmapText | null = null;
  private scoreTexts: Phaser.GameObjects.BitmapText[] = [];
  private noScoresText: Phaser.GameObjects.BitmapText | null = null;

  constructor() {
    super('Preview');
  }

  create() {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Background
    this.add.image(cx, height / 2, 'title_background').setOrigin(0.5);

    // Spawn decorative balloons behind text
    this.spawnBalloons();

    // Title
    this.add.bitmapText(cx, 35, 'coffee_spark', 'Zen', 48).setOrigin(0.5).setDepth(1);
    this.add.bitmapText(cx, 75, 'coffee_spark', 'Crossbow', 48).setOrigin(0.5).setDepth(1);

    // Welcome text placeholder
    this.welcomeText = this.add.bitmapText(cx, 120, 'moghul', 'Welcome!', 20).setOrigin(0.5).setDepth(1);

    // High scores header
    this.add.bitmapText(cx, 155, 'moghul', 'High Scores', 20).setOrigin(0.5).setDepth(1);

    // "No scores yet" placeholder (hidden once scores load)
    this.noScoresText = this.add.bitmapText(cx, 180, 'moghul', 'Loading...', 14).setOrigin(0.5).setDepth(1);

    // Fetch data
    this.fetchUserData();
    this.fetchHighScores();
  }

  private spawnBalloons() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    const { width, height } = this.scale;

    for (let i = 0; i < 6; i++) {
      const x = Phaser.Math.Between(-50, width);
      const y = Phaser.Math.Between(60, height - 40);
      const image = this.add.image(x, y, 'balloon')
        .setTint(Phaser.Math.RND.pick(colors))
        .setDepth(0)
        .setAlpha(0.7);

      this.balloons.push({
        image,
        speed: Phaser.Math.FloatBetween(30, 55),
        variance: Phaser.Math.FloatBetween(0.3, 0.6),
        oscillate: Phaser.Math.FloatBetween(0.001, 0.002),
      });
    }
  }

  override update(_time: number, delta: number) {
    const { width } = this.scale;
    const now = this.time.now;

    for (const b of this.balloons) {
      b.image.x += b.speed * (delta / 1000);
      b.image.y += Math.sin(now * b.oscillate) * b.variance;

      if (b.image.x > width + 60) {
        b.image.x = -50;
        b.image.y = Phaser.Math.Between(60, this.scale.height - 40);
      }
    }
  }

  private async fetchUserData() {
    try {
      const res = await fetch('/api/user');
      const data = await res.json();
      this.username = data.username ?? 'Anonymous';
    } catch {
      this.username = 'Anonymous';
    }

    if (this.welcomeText && this.welcomeText.active) {
      const display = this.username !== 'Anonymous' ? `Welcome, ${this.username}!` : 'Welcome!';
      this.welcomeText.setText(display);
    }
  }

  private async fetchHighScores() {
    try {
      const res = await fetch('/api/fetch-highscores');
      const data = await res.json();
      this.scores = data.scores ?? [];
    } catch {
      this.scores = [];
    }

    if (this.noScoresText && this.noScoresText.active) {
      this.noScoresText.destroy();
      this.noScoresText = null;
    }

    const cx = this.scale.width / 2;

    if (this.scores.length === 0) {
      this.noScoresText = this.add.bitmapText(cx, 180, 'moghul', 'No scores yet', 14).setOrigin(0.5).setDepth(1);
      return;
    }

    const startY = 180;
    const lineHeight = 22;
    for (let i = 0; i < Math.min(this.scores.length, 5); i++) {
      const entry = this.scores[i]!;
      const text = this.add.bitmapText(
        cx, startY + i * lineHeight,
        'moghul',
        `${i + 1}. ${entry.name}  ${entry.score}`,
        16
      ).setOrigin(0.5).setDepth(1);
      this.scoreTexts.push(text);
    }
  }
}
