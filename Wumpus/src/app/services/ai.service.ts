import { Injectable } from '@angular/core';
import { GenerateGameService } from './generate-game.service';
import { Player } from '../models/player.model';
import { Cell, CellType } from '../models/cell';
import { HelperService } from './helper.service';
import { PathFindingService } from './path-finding.service';
import { MatDialog } from '@angular/material/dialog';
import { MessageModalComponent } from '../components/message-modal/message-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  aiInterval: number = 1000;

  constructor(
    private generateGame: GenerateGameService,
    private helper: HelperService,
    private path: PathFindingService,
    private dialog: MatDialog
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

       //without path
  //     let lowestRiskCell = this.availableCells[0];
  //     for (const cell of this.availableCells) {
  //       if (cell.total_risk < lowestRiskCell.total_risk) {
  //         lowestRiskCell = cell;
  //       }
  //     }
  //  lowestRiskCell.adjacentCells=this.helper.calculateAdjacentCells(lowestRiskCell.position.row,lowestRiskCell.position.column)
  //     return { row: lowestRiskCell.position.row, column: lowestRiskCell.position.column };

      //------------without path


      //with path
      const newAdjacentUnvisitedCells = this.helper.calculateAdjacentUnvisitedCells(this.player.position.row, this.player.position.col);
      this.all_Unvisited_Cells.push(...newAdjacentUnvisitedCells);

      const currentCell = this.generateGame.board[this.player.position.row][this.player.position.col];
      let lowestRiskCell = this.path.findCellWithLeastDanger(currentCell, this.all_Unvisited_Cells);

      if (lowestRiskCell != null) {
        this.all_Unvisited_Cells = this.all_Unvisited_Cells.filter((target) => !this.path.areCellsEqual(target, lowestRiskCell));
        return { row: lowestRiskCell.position.row, column: lowestRiskCell.position.column };
      } else {
        console.log("No cell with the least danger found.");
        return { row: -1, column: -1 };
     }

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
        this.showMessage("You killed the wumpus!");
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
        this.showMessage("There wasn't any wumpus here.");
      }
    }

    else {
      this.showMessage('You have no arrow left')
    }

  }

  grabTreasure(row: number, col: number) {
    if (this.generateGame.board[row][col].type === CellType.Treasure) {
      this.generateGame.board[row][col].isHidden = false;
      this.showMessage("You got a treasure!");
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
  showMessage(message: string): void {
    const dialogRef = this.dialog.open(MessageModalComponent, {
      width: '300px',
      data: { message }
    })
    dialogRef.afterClosed().subscribe(() => {
    });
    dialogRef.disableClose = true;
  }

}



