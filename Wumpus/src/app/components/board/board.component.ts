import { Component, OnInit } from '@angular/core';
import { Cell, CellType } from 'src/app/models/cell';

function getCellTypeString(cellType: CellType): string {
  switch (cellType) {
    case CellType.Empty:
      return "Empty";
    case CellType.Wumpus:
      return "Wumpus";
    case CellType.Pit:
      return "Pit";
    case CellType.Treasure:
      return "Treasure";
    case CellType.Breeze:
      return "Breeze";
    case CellType.Smell:
      return "Smell";
    case CellType.Light:
      return "Light";
    case CellType.BreezeAndSmell:
      return "BreezeAndSmell";
    case CellType.BreezeAndLight:
      return "BreezeAndLight";
    case CellType.SmellAndLight:
      return "SmellAndLight";
    case CellType.BreezeAndPit:
      return "BreezeAndPit";
    case CellType.SmellAndPit:
      return "SmellAndPit";
    case CellType.LightAndPit:
      return "LightAndPit";
    case CellType.Smell_Breeze_And_Light:
      return "light_smell_breeze"
    default:
      return "Unknown";
  }
}


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  board: Cell[][] = [];
  exploredBoard: Cell[][] = [];
  playerPosition: { row: number; col: number; } = { row: 0, col: 0 };

  availableMoves: { row: number; col: number }[] = [];
  moveMode: boolean = false;


  ngOnInit(): void {
    this.playerPosition = { row: 0, col: 0 };
    this.initializeBoard();
    this.placePitsWumpusTreasure();

  }

  initializeBoard(): void {
    this.board = [];
    this.exploredBoard = [];
    for (let row = 0; row < 10; row++) {
      const newRow: Cell[] = [];
      for (let col = 0; col < 10; col++) {
        newRow.push({
          type: CellType.Empty,
          isCovered: true,
          hasBreeze: false,
          hasSmell: false,
          hasLight: false,
          score: 0
        });
      }
      this.board.push(newRow);
      this.exploredBoard.push(newRow);
    }
    this.board[0][0].isCovered = false;
    this.exploredBoard[0][0] = this.board[0][0];

    this.availableMoves = this.calculateAdjacentCells();
  }

  revealCell(rowIndex: number, colIndex: number): void {
    console.log(getCellTypeString(this.board[rowIndex][colIndex].type));
    if (this.isMoveAvailable(rowIndex, colIndex)) {
      this.board[rowIndex][colIndex].isCovered = false;
      this.playerPosition = { row: rowIndex, col: colIndex };
      this.availableMoves = this.calculateAdjacentCells();
      this.exploredBoard[rowIndex][colIndex] = this.board[rowIndex][colIndex];
    }
  }

  isMoveAvailable(rowIndex: number, colIndex: number): boolean {
    const adjacentCells = this.calculateAdjacentCells();
    return adjacentCells.some(
      (move) => move.row === rowIndex && move.col === colIndex
    );
  }

  isCellAvailableMove(rowIndex: number, colIndex: number): boolean {
    return this.availableMoves.some(
      (move) => move.row === rowIndex && move.col === colIndex
    );
  }

  calculateAdjacentCells(): { row: number; col: number }[] {
    const { row, col } = this.playerPosition;
    const adjacentCells = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    return adjacentCells.filter(
      (cell) =>
        cell.row >= 0 &&
        cell.row < this.board.length &&
        cell.col >= 0 &&
        cell.col < this.board[0].length
    );
  }



  //Generate game
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
        (rowIndex === 0 && colIndex === 0)
      );

      this.board[rowIndex][colIndex].type = elementType;
    }

    this.calculateBreezeSmellAndLight();
  }

  getCellImage(cellType: CellType): string {
    switch (cellType) {
      case CellType.Wumpus:
        return 'assets/wumpus.png';
      case CellType.Pit:
        return 'assets/hole.png';
      case CellType.Breeze:
        return 'assets/breeze.png';
      case CellType.Treasure:
        return 'assets/Treasure.jpg';
      case CellType.Smell:
        return 'assets/smell.png';
      case CellType.Light:
        return 'assets/light.jpg';
      case CellType.BreezeAndSmell:
        return 'assets/bs.png';
      case CellType.LightAndPit:
        return 'assets/LightAndPit.jpg';
      case CellType.BreezeAndLight:
        return 'assets/LightAndBreeze.jpg';
      case CellType.SmellAndLight:
        return 'assets/LightAndSmell.jpg';
      case CellType.Smell_Breeze_And_Light:
        return 'assets/light_smell_breeze.jpg';
      case CellType.Empty:
        return 'assets/bg.png';

      default:
        return '';
    }
  }

  calculateBreezeSmellAndLight(): void {
    this.generateCellTypes(CellType.Pit);
    this.generateCellTypes(CellType.Wumpus);
    this.generateCellTypes(CellType.Treasure);
  }

  generateCellTypes(sourceType: CellType): void {
    const offsets = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 },  // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 },  // Right
    ];

    for (let rowIndex = 0; rowIndex < this.board.length; rowIndex++) {
      for (let colIndex = 0; colIndex < this.board[rowIndex].length; colIndex++) {
        if (this.board[rowIndex][colIndex].type === sourceType) {
          for (const offset of offsets) {
            const adjacentRow = rowIndex + offset.row;
            const adjacentCol = colIndex + offset.col;

            if (
              adjacentRow >= 0 && adjacentRow < this.board.length &&
              adjacentCol >= 0 && adjacentCol < this.board[0].length
            ) {
              const adjacentCell = this.board[adjacentRow][adjacentCol];

              // Handle target types based on source type
              switch (sourceType) {
                case CellType.Pit:
                  this.handlePitTargetTypes(adjacentCell);
                  break;
                case CellType.Wumpus:
                  this.handleWumpusTargetTypes(adjacentCell);
                  break;
                case CellType.Treasure:
                  this.handleTreasureTargetTypes(adjacentCell);
                  break;
                // Add cases for other source types if needed
              }
            }
          }
        }
      }
    }
  }

  handlePitTargetTypes(cell: Cell): void {
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

  handleWumpusTargetTypes(cell: Cell): void {
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

  handleTreasureTargetTypes(cell: Cell): void {
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
