import { Scene } from 'phaser';
import type { HighScoreEntry, UserRankResponse } from '../../../shared/types/api.js';

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

  async create() {
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

    // Fetch data — username must resolve before high scores (used for rank display)
    await this.fetchUserData();
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
        speed: Phaser.Math.FloatBetween(15, 30),
        variance: Phaser.Math.FloatBetween(0.06, 0.1),
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
    let userRank: UserRankResponse = { type: 'user-rank', rank: null, score: null };

    try {
      const [scoresRes, rankRes] = await Promise.all([
        fetch('/api/fetch-highscores'),
        this.username !== 'Anonymous' ? fetch('/api/user-rank') : null,
      ]);
      const scoresData = await scoresRes.json();
      this.scores = scoresData.scores ?? [];
      if (rankRes) {
        userRank = await rankRes.json();
      }
    } catch {
      this.scores = [];
    }

    if (this.noScoresText && this.noScoresText.active) {
      this.noScoresText.destroy();
      this.noScoresText = null;
    }

    const cx = this.scale.width / 2;
    const startY = 180;
    const lineHeight = 22;
    const totalLines = 4;

    // Check if the current user is already in the top 3
    const userInTop3 = this.username !== 'Anonymous' &&
      this.scores.slice(0, 3).some((s) => s.name === this.username);

    // If user is NOT in top 3 and has a score, reserve the 4th slot for them
    const showUserIn4th = !userInTop3 && userRank.rank !== null && userRank.score !== null;
    const topSlots = showUserIn4th ? 3 : totalLines;

    // Build the top lines
    for (let i = 0; i < topSlots; i++) {
      const label = i < this.scores.length
        ? `${i + 1}. ${this.scores[i]!.name}  ${this.scores[i]!.score}`
        : `${i + 1}. ----------`;
      const text = this.add.bitmapText(
        cx, startY + i * lineHeight,
        'moghul', label, 16
      ).setOrigin(0.5).setDepth(1);
      this.scoreTexts.push(text);
    }

    // 4th line: user's rank if they're outside top 3, otherwise the 4th top score
    if (showUserIn4th) {
      const text = this.add.bitmapText(
        cx, startY + 3 * lineHeight,
        'moghul',
        `${userRank.rank}. ${this.username}  ${userRank.score}`,
        16
      ).setOrigin(0.5).setDepth(1);
      this.scoreTexts.push(text);
    }
  }
}
