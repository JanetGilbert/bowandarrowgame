export default class GameLevels {

  // Level structure
  private static readonly LEVELS: Array<any> = [
    { type: 'BalloonLevel', phase: 0, arrows: 10, targets: 20}, // 0
    { type: 'BalloonLevel', phase: 1, arrows: 8, targets: 20}, // 1
    { type: 'BubbleLevel', phase: 0, arrows: 15, targets: 20}, // 2
    { type: 'BubbleLevel', phase: 1, arrows: 15, targets: 20}, // 3
    { type: 'BirdLevel', phase: 0, arrows: 8, targets: 25}, // 4
    { type: 'BirdLevel', phase: 1, arrows: 8, targets: 30}, // 5
    { type: 'SnowflakeLevel', phase: 0, arrows: 8, targets: 30}, // 6
    { type: 'SnowflakeLevel', phase: 1, arrows: 11, targets: 20}, // 7
    { type: 'BallLevel', phase: 0, arrows: 8, targets: 15}, // 8
    { type: 'BallLevel', phase: 1, arrows: 12, targets: 15}, // 9
  ];


  static getLevelDefinition(levelNum: number): [levelType: string, phase: number, arrows: number, targets: number] {
    const wrappedLevel = this.LEVELS[levelNum % this.LEVELS.length];
    return [wrappedLevel.type, wrappedLevel.phase, wrappedLevel.arrows, wrappedLevel.targets];
  }
}
