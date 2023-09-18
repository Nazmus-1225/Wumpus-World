import { Component, OnInit } from '@angular/core';

enum CellType {
  Empty,
  Wumpus,
  Pit,
  Treasure,
  Breeze,
  Smell,
  BreezeAndSmell
}

interface Cell {
  type: CellType;
  isCovered: boolean;
  hasBreeze: boolean;
  hasSmell: boolean;
  isAdjacentToTreasure: boolean;
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  board: Cell[][] = [];
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
    for (let row = 0; row < 10; row++) {
      const newRow: Cell[] = [];
      for (let col = 0; col < 10; col++) {
        newRow.push({
          type: CellType.Empty, isCovered: true, hasBreeze: false, hasSmell: false,
          isAdjacentToTreasure: false,
         
        });
      }
      this.board.push(newRow);
    }
  }

  calculateAvailableMoves() {
    const { row, col } = this.playerPosition;
    const adjacentCells = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    this.availableMoves = adjacentCells.filter(
      (cell) =>
        cell.row >= 0 &&
        cell.row < this.board.length &&
        cell.col >= 0 &&
        cell.col < this.board[0].length
    );
  }

  onPlayerClick() {
    if (!this.moveMode) {
      this.moveMode = true;
      this.calculateAvailableMoves();
    } else {
      this.moveMode = false;
      this.availableMoves = [];
    }
  }

  onCellClick(rowIndex: number, colIndex: number) {
    if (this.moveMode) {
      const selectedMove = this.availableMoves.find(
        (move) =>
          move.row === rowIndex && move.col === colIndex
      );

      if (selectedMove) {
        this.playerPosition = selectedMove;
        this.moveMode = false;
        this.availableMoves = [];
      }
    }
  }

  placePitsWumpusTreasure(): void {
    this.placeRandomElements(CellType.Pit, 5); // Place 5 pits
    this.placeRandomElements(CellType.Wumpus, 1); // Place 1 Wumpus
    this.placeRandomElements(CellType.Treasure, 1); // Place 1 treasure
  }
  


  //Generate game
  placeRandomElements(elementType: CellType, count: number): void {
    for (let i = 0; i < count; i++) {
      let rowIndex: number;
      let colIndex: number;
      do {

        rowIndex = Math.floor(Math.random() * this.board.length);
        colIndex = Math.floor(Math.random() * this.board[0].length);
      } while (this.board[rowIndex][colIndex].type !== CellType.Empty);

      // Place the element at the random position
      this.board[rowIndex][colIndex].type = elementType;
    }

    this.calculateBreezeAndSmell();
    this.highlightAdjacentToTreasure();
    
  }

  getCellImage(cellType: CellType): string {
    switch (cellType) {
      case CellType.Wumpus:
        return 'assets/wumpus.png';
      case CellType.Pit:
        return 'assets/hole2.jpg';
      case CellType.Breeze:
        return 'assets/breeze4.png';
      case CellType.Treasure:
        return 'assets/Treasure.jpg';
      case CellType.Smell:
        return 'assets/smell2.png';
      case CellType.BreezeAndSmell:
        return 'assets/bs.png';
      case CellType.Empty:
        return 'assets/bg3.jpg';
      default:
        return '';
    }
  }

  calculateBreezeAndSmell(): void {
    for (let rowIndex = 0; rowIndex < this.board.length; rowIndex++) {
      for (let colIndex = 0; colIndex < this.board[rowIndex].length; colIndex++) {
        if (this.board[rowIndex][colIndex].type === CellType.Pit) {
          this.setBreezeOnAdjacentCells(rowIndex, colIndex);
        }
        if (this.board[rowIndex][colIndex].type === CellType.Wumpus) {
          this.setSmellOnAdjacentCells(rowIndex, colIndex);
        }
      }
    }
  }

  setBreezeOnAdjacentCells(rowIndex: number, colIndex: number): void {
    const offsets = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 },  // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 }   // Right
    ];

    for (const offset of offsets) {
      const adjacentRow = rowIndex + offset.row;
      const adjacentCol = colIndex + offset.col;

      if (
        adjacentRow >= 0 && adjacentRow < this.board.length &&
        adjacentCol >= 0 && adjacentCol < this.board[0].length
      ) {
        // Set the breeze property to true for adjacent cells
        this.board[adjacentRow][adjacentCol].hasBreeze = true;
        this.board[adjacentRow][adjacentCol].type = CellType.Breeze;
      }
    }
  }

  setSmellOnAdjacentCells(rowIndex: number, colIndex: number): void {
    const offsets = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 },  // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 }   // Right
    ];

    for (const offset of offsets) {
      const adjacentRow = rowIndex + offset.row;
      const adjacentCol = colIndex + offset.col;

      if (
        adjacentRow >= 0 && adjacentRow < this.board.length &&
        adjacentCol >= 0 && adjacentCol < this.board[0].length
      ) {
        // Set the smell property to true for adjacent cells
        this.board[adjacentRow][adjacentCol].hasSmell = true;

        // If the cell already has a breeze, set both breeze and smell properties
        if (this.board[adjacentRow][adjacentCol].hasBreeze) {
          this.board[adjacentRow][adjacentCol].type = CellType.BreezeAndSmell;
        } else {
          this.board[adjacentRow][adjacentCol].type = CellType.Smell;
        }
      }
    }
  }

  highlightAdjacentToTreasure(): void {
    for (let rowIndex = 0; rowIndex < this.board.length; rowIndex++) {
      for (let colIndex = 0; colIndex < this.board[rowIndex].length; colIndex++) {
        if (this.board[rowIndex][colIndex].type === CellType.Treasure) {
          this.setAdjacentToTreasure(rowIndex, colIndex);
        }
      }
    }
  }

  setAdjacentToTreasure(treasureRowIndex: number, treasureColIndex: number): void {
    const offsets = [
      { row: -1, col: 0 }, // Up
      { row: 1, col: 0 },  // Down
      { row: 0, col: -1 }, // Left
      { row: 0, col: 1 }   // Right
    ];

    for (const offset of offsets) {
      const adjacentRow = treasureRowIndex + offset.row;
      const adjacentCol = treasureColIndex + offset.col;

      if (
        adjacentRow >= 0 && adjacentRow < this.board.length &&
        adjacentCol >= 0 && adjacentCol < this.board[0].length
      ) {
        this.board[adjacentRow][adjacentCol].isAdjacentToTreasure = true;
      }
    }
  }
  getCellClass(rowIndex: number, colIndex: number): string {
    // Implement logic to return additional CSS classes based on cell type or game state
    // For example, you can add CSS classes for highlighting the player's position.
    return '';
  }



  revealCell(rowIndex: number, colIndex: number): void {
    if (this.board[rowIndex][colIndex].isCovered) {
      this.board[rowIndex][colIndex].isCovered = false;
      this.playerPosition = { row: rowIndex, col: colIndex };
    }
console.log(this.board[rowIndex][colIndex])

  }

  // revealCell(rowIndex: number, colIndex: number): void {
  //   const cell = this.board[rowIndex][colIndex];
  
  //   if (cell.isCovered && this.moveMode && this.isMoveAvailable(rowIndex, colIndex)) {
  //     this.playerPosition = { row: rowIndex, col: colIndex };
  //     this.moveMode = false;
  //     this.availableMoves = [];
  //   } else if (cell.isCovered) {
  //     cell.isCovered = false;
  //   }
  
  //   console.log(cell);
  // }
  
  // Function to check if a cell is an available move
  isMoveAvailable(rowIndex: number, colIndex: number): boolean {
    return this.availableMoves.some((move) => move.row === rowIndex && move.col === colIndex);
  }
}
