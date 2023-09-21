export enum CellType {
    Empty,
    Wumpus,
    Pit,
    Treasure,
    Breeze,
    Smell,
    Light,
    BreezeAndSmell,
    BreezeAndLight,
    SmellAndLight,
    BreezeAndPit,
    SmellAndPit,
    LightAndPit,
    Smell_Breeze_And_Light //yet to implement
  }
export interface Cell {
    type: CellType;
    isCovered: boolean;
    hasBreeze: boolean;
    hasSmell: boolean;
    hasLight: boolean;
    score: number;
  }

