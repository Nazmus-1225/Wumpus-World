export enum CellType {
    Empty,
    Wumpus,
    DeadWumpus,
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
    Smell_Breeze_And_Light
  }
export interface Cell {
    type: CellType;
    position: { row: number; col: number } ;
    isVisited: boolean;
    hasBreeze: boolean;
    hasSmell: boolean;
    hasLight: boolean;
    flag_score: number;
  }