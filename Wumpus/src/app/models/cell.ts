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
    position: { row: number; column: number };
    isHidden: boolean;
    hasBreeze: boolean;
    hasSmell: boolean;
    hasLight: boolean;
    wumpus_probability: number;
    pit_probability: number;
    treasure_probability: number; //keeping it negative
    
    risk_score: number;
    visit_risk: number;
    total_risk: number;
    adjacentCells: Cell[];
    f_score?: number; 
    g_score?: number;

  }

