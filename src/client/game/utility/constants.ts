export default class GameLevels {

  // Level structure
  private static readonly LEVELS: Array<any> = [
    { type: 'BalloonLevel', phase: 0}, // 0
    { type: 'BalloonLevel', phase: 1}, // 1
    { type: 'BubbleLevel', phase: 0}, // 2
  ];

  
  static getLevelDefinition(levelNum: number): [levelType: string, phase: number] {
    const wrappedLevel = this.LEVELS[levelNum % this.LEVELS.length];
    return [wrappedLevel.type, wrappedLevel.phase];
  }
}
