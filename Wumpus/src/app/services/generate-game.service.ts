import { Injectable } from '@angular/core';
import { Cell, CellType } from '../models/cell';

@Injectable({
  providedIn: 'root',
})
export class GenerateGameService {
  board: Cell[][] = [];
  wumpus_count: number = 1;
  pit_count: number = 5;
  custom_input: boolean = false;
  treasure_count: number = 1;
  treasure_left: number = 1;
  parsedBoardData: string[][] = [];
  constructor() {
    this.wumpus_count = parseInt(
      localStorage.getItem('wumpus_count') || '1',
      10
    );
    this.pit_count = parseInt(localStorage.getItem('pit_count') || '5', 10);
    this.treasure_count = parseInt(
      localStorage.getItem('treasure_count') || '1',
      10
    );
    this.treasure_left = this.treasure_count;
  }

  getBoard(): Cell[][] {
    return this.board;
  }
  setParsedBoardData(boardData: string[][]): void {
    this.parsedBoardData = boardData;
  }

  getParsedBoardData(): string[][] {
    return this.parsedBoardData;
  }
  setwumpusCount(wumpus_count: number) {
    console.log('Wumpus Count ' + wumpus_count);
    this.wumpus_count = wumpus_count;
  }

  setpitCount(pit_count: number) {
    this.pit_count = pit_count;
  }
  setgoldCount(treasure_count: number) {
    console.log('Gold count ' + treasure_count);
    this.treasure_count = treasure_count;
  }
  setCustomInput(custom_input: boolean) {
    this.custom_input = custom_input;
  }

  placePitsWumpusTreasure(): void {
    if (!this.custom_input) {
      console.log("disi input")
      this.placeRandomElements(CellType.Pit, this.pit_count); 
      this.placeRandomElements(CellType.Wumpus, this.wumpus_count); 
      this.placeRandomElements(CellType.Treasure, this.treasure_count); 
    } else {
     console.log("deinai input");
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const char = this.parsedBoardData[row][col];
          const cellType = this.mapCharacterToCellType(char);
          this.board[row][col].type = cellType;
        }
      }
    }
  }
  mapCharacterToCellType(char: string): CellType {
    switch (char) {
      case 'P':
        return CellType.Pit;
      case 'W':
        return CellType.Wumpus;
      case 'T':
        return CellType.Treasure;
      case 'S':
        return CellType.Smell;
      case 'B':
        return CellType.Breeze;
      case 'L':
        return CellType.Light;
      case 'E':
        return CellType.Empty;
      case 'A':
        return CellType.BreezeAndSmell;
      case 'C':
        return CellType.BreezeAndLight;
      case 'D':
        return CellType.SmellAndLight;
      case 'E':
        return CellType.BreezeAndPit;
      case 'F':
        return CellType.SmellAndPit;
      case 'G':
        return CellType.LightAndPit;
      case 'H':
        return CellType.Smell_Breeze_And_Light;
      default:
        return CellType.Empty; 
    }
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
      { row: 1, col: 0 }, // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 }, // Right
    ];

    for (let rowIndex = 0; rowIndex < this.board.length; rowIndex++) {
      for (
        let colIndex = 0;
        colIndex < this.board[rowIndex].length;
        colIndex++
      ) {
        if (this.board[rowIndex][colIndex].type === cellType) {
          for (const offset of offsets) {
            const adjacentRow = rowIndex + offset.row;
            const adjacentCol = colIndex + offset.col;

            if (
              adjacentRow >= 0 &&
              adjacentRow < this.board.length &&
              adjacentCol >= 0 &&
              adjacentCol < this.board[0].length
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

// function boardToString(board: Cell[][]): string {
//   let result = '';
//   for (let row = 0; row < board.length; row++) {
//     for (let col = 0; col < board[row].length; col++) {
//       const cellType = board[row][col].type;
//       result += `${cellType}\t`; // Separate with a tab
//     }
//     result += '\n'; // Newline after each row
//   }
//   return result;
// }

// function stringToBoard(boardString: string): Cell[][] {
//   const rows = boardString.trim().split('\n');
//   const board: Cell[][] = [];

//   for (const row of rows) {
//     const cellTypes = row.trim().split('\t');
//     const boardRow: Cell[] = [];

//     for (const cellType of cellTypes) {
//       // Parse the cellType and create a new Cell object
//       const cell: Cell = {
//         type: parseInt(cellType),
//         position: {
//           row: 0,
//           column: 0,
//         },
//         isHidden: false,
//         hasBreeze: false,
//         hasSmell: false,
//         hasLight: false,
//         wumpus_probability: 0,
//         pit_probability: 0,
//         treasure_probability: 0,
//         risk_score: 0,
//       };
//       boardRow.push(cell);
//     }

//     board.push(boardRow);
//   }

//   return board;
// }
