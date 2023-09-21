import { Injectable } from '@angular/core';
import { GenerateGameService } from './generate-game.service';
import { Player } from '../models/player.model';
import { Cell, CellType } from 'src/app/models/cell';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  aiInterval: number =1000;

  constructor(
    private generateGame: GenerateGameService
  ) { }
  randomRow: number = 0;
  randomCol: number = 0;
  player: Player = new Player();
  availableCells: Cell[]=[];
  availableMoves: { row: number; col: number }[] = [];

  makeAIMove(): { row: number, column: number } {
    if (this.availableMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.availableMoves.length);
      const randomMove = this.availableMoves[randomIndex];

      return { row: randomMove.row, column: randomMove.col };
    } else {
      clearInterval(this.aiInterval);
      return { row: -1, column: -1 }; 
    }
  }
  shootArrow(row: number, col: number) {
    if (this.player.hasArrow) {
      this.player.hasArrow = false;
      this.player.point -= 10;
      console.log("shoot");
      this.generateGame.board[row][col].isVisited = false;
     // this.exploredBoard[row][col] = this.generateGame.board[row][col];
      // console.log( this.board[row][col].type);

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
  calculateAdjacentCells(): { row: number; col: number }[] {
    const { row, col } = this.player.position;
    const adjacentCells = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    return adjacentCells.filter(
      (cell) =>
        cell.row >= 0 &&
        cell.row < this.generateGame.board.length &&
        cell.col >= 0 &&
        cell.col < this.generateGame.board[0].length
    );
  }

}



