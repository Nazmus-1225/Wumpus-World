import { Injectable } from '@angular/core';
import { Cell, CellType } from '../models/cell';

@Injectable({
  providedIn: 'root'
})
export class GenerateGameService {
  board: Cell[][] = [];

  constructor() { }

  getBoard(): Cell[][]{
    return this.board;
  }

  placePitsWumpusTreasure(): void {
    this.placeRandomElements(CellType.Pit, 5); // Place 5 pits
    this.placeRandomElements(CellType.Wumpus, 1); // Place 1 Wumpus
    this.placeRandomElements(CellType.Treasure, 1); // Place 1 treasure
  }

  placeRandomElements(elementType: CellType, count: number): void {
    for (let i = 0; i < count; i++) {
      let rowIndex: number;
      let colIndex: number;
      do {
        rowIndex = Math.floor(Math.random() * this.board.length);
        colIndex = Math.floor(Math.random() * this.board[0].length);
      } while (
        this.board[rowIndex][colIndex].type !== CellType.Empty ||
        (rowIndex === 0 && colIndex === 9)
      );

      this.board[rowIndex][colIndex].type = elementType;
    }

    this.calculateBreezeSmellAndLight();
  }


  calculateBreezeSmellAndLight(): void {
    this.generateCellTypes(CellType.Pit);
    this.generateCellTypes(CellType.Wumpus);
    this.generateCellTypes(CellType.Treasure);
  }

  generateCellTypes(cellType: CellType): void {
    const offsets = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 },  // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 },  // Right
    ];

    for (let rowIndex = 0; rowIndex < this.board.length; rowIndex++) {
      for (let colIndex = 0; colIndex < this.board[rowIndex].length; colIndex++) {
        if (this.board[rowIndex][colIndex].type === cellType) {
          for (const offset of offsets) {
            const adjacentRow = rowIndex + offset.row;
            const adjacentCol = colIndex + offset.col;

            if (
              adjacentRow >= 0 && adjacentRow < this.board.length &&
              adjacentCol >= 0 && adjacentCol < this.board[0].length
            ) {
              const adjacentCell = this.board[adjacentRow][adjacentCol];

              // Handle target types based on source type
              switch (cellType) {
                case CellType.Pit:
                  this.handlePit(adjacentCell);
                  break;
                case CellType.Wumpus:
                  this.handleWumpus(adjacentCell);
                  break;
                case CellType.Treasure:
                  this.handleTreasure(adjacentCell);
                  break;
                // Add cases for other source types if needed
              }
            }
          }
        }
      }
    }
  }

  handlePit(cell: Cell): void {
    // Handle target types for Pit source
    switch (cell.type) {
      case CellType.Empty:
        cell.type = CellType.Breeze;
        cell.hasBreeze = true;
        break;
      case CellType.Smell:
        cell.type = CellType.BreezeAndSmell;
        cell.hasBreeze = true;
        break;
      case CellType.Light:
        cell.type = CellType.BreezeAndLight;
        cell.hasBreeze = true;
        break;
      case CellType.SmellAndLight:
        cell.type = CellType.Smell_Breeze_And_Light;
        cell.hasBreeze = true;
        break;
      case CellType.Treasure:
        // If a pit is adjacent to treasure, it doesn't change to Light
        cell.type = CellType.BreezeAndLight;
        cell.hasBreeze = true;
        break;
    }
  }

  handleWumpus(cell: Cell): void {
    // Handle target types for Wumpus source
    switch (cell.type) {
      case CellType.Empty:
        cell.type = CellType.Smell;
        cell.hasSmell = true;
        break;
      case CellType.Breeze:
        cell.type = CellType.BreezeAndSmell;
        cell.hasSmell = true;
        break;
      case CellType.Light:
        cell.type = CellType.SmellAndLight;
        cell.hasSmell = true;
        break;
      case CellType.BreezeAndLight:
        cell.type = CellType.Smell_Breeze_And_Light;
        cell.hasSmell = true;
        break;

    }
  }

  handleTreasure(cell: Cell): void {
    // Handle target types for Treasure source
    switch (cell.type) {
      case CellType.Empty:
        cell.type = CellType.Light;
        break;
      case CellType.Breeze:
        cell.type = CellType.BreezeAndLight;
        break;
      case CellType.Smell:
        cell.type = CellType.SmellAndLight;
        break;
      case CellType.BreezeAndSmell:
        cell.type = CellType.Smell_Breeze_And_Light;
        break;
      case CellType.Pit:
        // If a pit is adjacent to treasure, don't change it to Light
        break;
      default:
      // Add cases for other target types if needed
    }
  }
}
