export enum CellType {
    Empty,
    Wumpus,
    DeadWumpus,
    Pit,
    Treasure,
    Breeze,
    Smell,
    BreezeAndSmell,
    BreezeAndPit,
    SmellAndPit,
  }
export interface Cell {
    type: CellType;
    position: { row: number; column: number };
    isHidden: boolean;
    hasBreeze: boolean;
    hasSmell: boolean;
    wumpus_probability: number;
    pit_probability: number;
    treasure_probability: number; //keeping it negative 
    risk_score: number;
    visit_risk: number;
    total_risk: number;
    adjacentCells: Cell[];
    f_score: number; 
    g_score: number;


  }

