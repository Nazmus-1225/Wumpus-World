import { Injectable } from '@angular/core';
import { GenerateGameService } from './generate-game.service';
import { Player } from '../models/player.model';
import { Cell, CellType } from '../models/cell';
import { EvaluateService } from './evaluate.service';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  aiInterval: number = 1000;

  constructor(
    private generateGame: GenerateGameService,
    private helper: HelperService
  ) { }
  
  randomRow: number = 0;
  randomCol: number = 0;
  player: Player = new Player();
  availableCells: Cell[] = [];
  arrowShot = false;
  exploredBoard: Cell[][] = [];

  makeAIMove(): { row: number, column: number } {
    if (this.availableCells.length > 0) {

      for (const cell of this.availableCells) {
        //     console.log(cell.position.row+"    "+cell.position.column+"   ")
        if (cell.wumpus_probability > 0.8 && !this.arrowShot) {
          this.shootArrow(cell.position.row, cell.position.column);
          this.arrowShot = true;
          return { row: -1, column: -1 };
        }
      }
      let lowestRiskCell = this.availableCells[0];
      console.log("Risk score: ");
      for (const cell of this.availableCells) {
        console.log(cell.risk_score);

        if (cell.risk_score < lowestRiskCell.risk_score) {
          lowestRiskCell = cell;
        }
      }

      console.log("row: " + lowestRiskCell.position.row + " column: " + lowestRiskCell.position.column);
      return { row: lowestRiskCell.position.row, column: lowestRiskCell.position.column };
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



}



