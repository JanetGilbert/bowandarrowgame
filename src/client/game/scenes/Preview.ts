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
  private userRank: UserRankResponse = { type: 'user-rank', rank: null, score: null };

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
    const bg = this.add.image(cx, height / 2, 'splash_background').setOrigin(0.5);
    const scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale);
    // Spawn decorative balloons behind text
    this.spawnBalloons();

    // Title
    this.add.bitmapText(cx, 35, 'coffee_spark', 'Zen', 48).setOrigin(0.5).setDepth(1);
    this.add.bitmapText(cx, 75, 'coffee_spark', 'Crossbow', 48).setOrigin(0.5).setDepth(1);

    // Welcome text 
    this.welcomeText = this.add.bitmapText(cx, 120, 'moghul', 'Welcome!', 20).setOrigin(0.5).setDepth(1);

    // High scores header
    this.add.bitmapText(cx, 155, 'moghul', 'High Scores', 20).setOrigin(0.5).setDepth(1);

    // "No scores yet" placeholder (hidden once scores load)
    this.noScoresText = this.add.bitmapText(cx, 180, 'moghul', 'Loading...', 14).setOrigin(0.5).setDepth(1);

    // Fetch data — username must resolve before high scores (used for rank display)
    await this.fetchUserData();
    this.fetchHighScores();

    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const newCx = gameSize.width / 2;
      const newCy = gameSize.height / 2;

      // Reposition background
      bg.setPosition(newCx, newCy);
      const s = Math.max(gameSize.width / bg.width, gameSize.height / bg.height);
      bg.setScale(s);

      // Reposition all centered elements
      this.children.each((child: Phaser.GameObjects.GameObject) => {
        if (child instanceof Phaser.GameObjects.BitmapText) {
          child.setX(newCx);
        }
      });

      this.renderScoreTable();
    });
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
    const maxRows = this.getMaxScoreRows();

    try {
      const [scoresRes, rankRes] = await Promise.all([
        fetch(`/api/fetch-highscores?limit=${maxRows}`),
        this.username !== 'Anonymous' ? fetch('/api/user-rank') : null,
      ]);
      const scoresData = await scoresRes.json();
      this.scores = scoresData.scores ?? [];
      if (rankRes) {
        this.userRank = await rankRes.json();
      }
    } catch {
      this.scores = [];
      this.userRank = { type: 'user-rank', rank: null, score: null };
    }

    this.renderScoreTable();
  }

  private getMaxScoreRows(): number {
    const startY = 180;
    const lineHeight = 22;
    const bottomPadding = 120;
    return Phaser.Math.Clamp(
      Math.floor((this.scale.height - startY - bottomPadding) / lineHeight),
      4,
      14
    );
  }

  private renderScoreTable(): void {
    for (const text of this.scoreTexts) {
      if (text.active) {
        text.destroy();
      }
    }
    this.scoreTexts = [];

    if (this.noScoresText && this.noScoresText.active) {
      this.noScoresText.destroy();
      this.noScoresText = null;
    }

    const cx = this.scale.width / 2;
    const startY = 180;
    const lineHeight = 22;
    const totalLines = this.getMaxScoreRows();

    // Check if the current user is already in the top lines
    const userVisibleSlots = Math.max(0, totalLines - 1);
    const userInTopRows = this.username !== 'Anonymous' &&
      this.scores.slice(0, userVisibleSlots).some((s) => s.name === this.username);

    // If user is NOT in top lines and has a score, reserve the last slot for them
    const showUserInLastRow = !userInTopRows && this.userRank.rank !== null && this.userRank.score !== null;
    const topSlots = showUserInLastRow ? userVisibleSlots : totalLines;

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

    // Last line: user's rank if they're outside the visible top rows.
    if (showUserInLastRow) {
      const text = this.add.bitmapText(
        cx, startY + (totalLines - 1) * lineHeight,
        'moghul',
        `${this.userRank.rank}. ${this.username}  ${this.userRank.score}`,
        16
      ).setOrigin(0.5).setDepth(1);
      this.scoreTexts.push(text);
    }
  }
}
