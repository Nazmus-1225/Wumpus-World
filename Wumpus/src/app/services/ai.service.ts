import { Injectable } from '@angular/core';
import { GenerateGameService } from './generate-game.service';
import { Player } from '../models/player.model';
import { Cell, CellType } from '../models/cell';
import { HelperService } from './helper.service';
import { PathFindingService } from './path-finding.service';
import { EvaluateService } from './evaluate.service';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  aiInterval: number = 1000;

  constructor(
    private generateGame: GenerateGameService,
    private helper: HelperService,
    private path: PathFindingService
  ) { }

  randomRow: number = 0;
  randomCol: number = 0;
  player: Player = new Player();
  availableCells: Cell[] = [];  //Updated in board.ts -> revealCell
  all_Unvisited_Cells: Cell[] = [];
  arrowShot = false;
  exploredBoard: Cell[][] = [];

  makeAIMove(): { row: number, column: number } {
    if (this.availableCells.length > 0) {
      //Shoot wumpus
      for (const cell of this.availableCells) {
        if (cell.wumpus_probability > 0.8 && !this.arrowShot) {
          this.shootArrow(cell.position.row, cell.position.column);
          this.arrowShot = true;
          return { row: -1, column: -1 };
        }
      }
      // this.evaluate.updateRisk(this.player.position.row, this.player.position.col); 

//       //without path
//       let lowestRiskCell = this.availableCells[0];
//    //   console.log("Adjacent Risk score: ");
//       for (const cell of this.availableCells) {
//       //  console.log(cell.total_risk);

//         if (cell.total_risk < lowestRiskCell.total_risk) {
//           lowestRiskCell = cell;
//         }
//       }
//    //   console.log("Lowest: "+lowestRiskCell.position.row+" , "+lowestRiskCell.position.column+" , "+lowestRiskCell.isHidden);
//    //   console.log("lowest risk: "+lowestRiskCell.total_risk);
//    lowestRiskCell.adjacentCells=this.helper.calculateAdjacentCells(lowestRiskCell.position.row,lowestRiskCell.position.column)
// //    console.log("Adjacent cells for row " + lowestRiskCell.position.column + ", column " + lowestRiskCell.position.row + ":");
// //   lowestRiskCell.adjacentCells.forEach((adjacentCell) => {
// //     console.log("Row: " + adjacentCell.position.column + ", Column: " + adjacentCell.position.row);
// // });

// console.log("done done")
//       return { row: lowestRiskCell.position.row, column: lowestRiskCell.position.column };

      //------------without path


      //with path
      const newAdjacentUnvisitedCells = this.helper.calculateAdjacentUnvisitedCells(this.player.position.row, this.player.position.col);
      this.all_Unvisited_Cells.push(this.exploredBoard[0][9]);
      this.all_Unvisited_Cells.push(...newAdjacentUnvisitedCells);

      const currentCell = this.generateGame.board[this.player.position.row][this.player.position.col];
      let lowestRiskCell = this.path.findCellWithLeastDanger(currentCell, this.all_Unvisited_Cells, this.generateGame.board);
      if (lowestRiskCell != null) {
      //  console.log("row: " + lowestRiskCell.position.row + " column: " + lowestRiskCell.position.column);
        return { row: lowestRiskCell.position.row, column: lowestRiskCell.position.column };
      }
      else
        return { row: -1, column: -1 }

      //----------------with path


    } else {
      clearInterval(this.aiInterval);
      return { row: -1, column: -1 };
    }
  }


  shootArrow(row: number, col: number) {
    if (this.player.hasArrow) {
      this.player.hasArrow = false;
      this.player.point -= 10;
      this.generateGame.board[row][col].isHidden = false;
      this.exploredBoard[row][col] = this.generateGame.board[row][col];

      if (this.generateGame.board[row][col].type === CellType.Wumpus) {
        alert("You killed the wumpus!");
        this.generateGame.board[row][col].type = CellType.DeadWumpus;

        //remove smell from adjacents
        const adjacentCells = this.helper.calculateAdjacentCells(row, col);
        for (const adjacentCell of adjacentCells) {
          if (adjacentCell.type === CellType.Smell) {
            adjacentCell.type = CellType.Empty;
            const adjacentRow = adjacentCell.position.row;
            const adjacentCol = adjacentCell.position.column;
            this.exploredBoard[adjacentRow][adjacentCol] = adjacentCell;
          }
        }
      }
      else {
        alert("There wasn't any wumpus here.");
      }
    }

    else {
      alert('You have no arrow left')
    }

  }

  grabTreasure(row: number, col: number) {
    if (this.generateGame.board[row][col].type === CellType.Treasure) {
      this.generateGame.board[row][col].isHidden = false;
      alert("You got a treasure!");
      this.generateGame.board[row][col].type = CellType.Empty;
      //remove light from adjacents
      const adjacentCells = this.helper.calculateAdjacentCells(row, col);
      for (const adjacentCell of adjacentCells) {
        if (adjacentCell.type === CellType.Light) {
          adjacentCell.type = CellType.Empty;
          const adjacentRow = adjacentCell.position.row;
          const adjacentCol = adjacentCell.position.column;
          this.exploredBoard[adjacentRow][adjacentCol] = adjacentCell;
        }

        else if (adjacentCell.type === CellType.BreezeAndLight) {
          adjacentCell.type = CellType.Breeze;
          const adjacentRow = adjacentCell.position.row;
          const adjacentCol = adjacentCell.position.column;
          this.exploredBoard[adjacentRow][adjacentCol] = adjacentCell;
        }
        
        else if (adjacentCell.type === CellType.SmellAndLight) {
          adjacentCell.type = CellType.Smell;
          const adjacentRow = adjacentCell.position.row;
          const adjacentCol = adjacentCell.position.column;
          this.exploredBoard[adjacentRow][adjacentCol] = adjacentCell;
        }
      }
    }

  }


}



