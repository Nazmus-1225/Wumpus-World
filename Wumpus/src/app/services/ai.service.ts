import { Injectable } from '@angular/core';
import { GenerateGameService } from './generate-game.service';
import { Player } from '../models/player.model';
import { Cell, CellType } from '../models/cell';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  aiInterval: number = 1000;

  constructor(
    private generateGame: GenerateGameService
  ) { }
  randomRow: number = 0;
  randomCol: number = 0;
  player: Player = new Player();
  availableCells: Cell[] = [];
  // availableMoves: { row: number; col: number }[] = [];
  exploredBoard: Cell[][] = [];

  makeAIMove(): { row: number, column: number } {
    if (this.availableCells.length > 0) {
      let lowestRiskCell = this.availableCells[0];
      for (const cell of this.availableCells) {
        if (cell.risk_score < lowestRiskCell.risk_score) {
          lowestRiskCell = cell;
        }
      }
  
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
      }
      else {
        alert("There wasn't any wumpus here.");
      }
    }

    else {
      alert('You have no arrow left')
    }

  }

  calculateAdjacentCells(): Cell[] {
    const { row, col } = this.player.position;
    const adjacentCellPositions = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    const validAdjacentCellPositions = adjacentCellPositions.filter((position) =>
      this.isValidCellPosition(position.row, position.col)
    );

    const adjacentCells = validAdjacentCellPositions.map((position) =>
      this.generateGame.board[position.row][position.col]
    );

    return adjacentCells;
  }

  isValidCellPosition(row: number, col: number): boolean {
    return (
      row >= 0 &&
      row < this.generateGame.board.length &&
      col >= 0 &&
      col < this.generateGame.board[0].length
    );
  }


}



