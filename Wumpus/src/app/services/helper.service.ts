import { Injectable } from '@angular/core';
import { GenerateGameService } from './generate-game.service';
import { Cell } from '../models/cell';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor( private generateGame: GenerateGameService) { }

  calculateAdjacentCells(row: number, col: number): Cell[] {
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

  calculateAdjacentUnvisitedCells(row: number, col: number): Cell[] {
    const adjacentCellPositions = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];
  
    const validAdjacentUnvisitedCellPositions = adjacentCellPositions.filter(
      (position) =>
        this.isValidCellPosition(position.row, position.col) &&
        this.generateGame.board[position.row][position.col].isHidden
    );
  
    const adjacentUnvisitedCells = validAdjacentUnvisitedCellPositions.map(
      (position) => this.generateGame.board[position.row][position.col]
    );
  
    return adjacentUnvisitedCells;
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
