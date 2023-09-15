import { Component, OnInit } from '@angular/core';

enum CellType {
  Empty,
  Wumpus,
  Pit,
  Treasure,
}

interface Cell {
  type: CellType;
  isCovered: boolean;
  hasBreeze: boolean;
}

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  board: Cell[][]=[];
  playerPosition: { row: number; col: number; }= {row:0, col:0};

  ngOnInit(): void {
    this.initializeBoard();
    this.placePitsAndWumpus();
    this.playerPosition = { row: 0, col: 0 };
    this.calculateBreeze();
  }

  initializeBoard(): void {
    this.board = [];
    for (let row = 0; row < 10; row++) {
      const newRow: Cell[] = [];
      for (let col = 0; col < 10; col++) {
        newRow.push({ type: CellType.Empty, isCovered: true ,hasBreeze:false});
      }
      this.board.push(newRow);
    }
  }

  placePitsAndWumpus(): void {
    this.placeRandomElements(CellType.Pit, 10);
    this.placeRandomElements(CellType.Wumpus, 1);
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
    
  }

  getCellImage(cellType: CellType): string {
    switch (cellType) {
      case CellType.Wumpus:
        return 'assets/wumpus.jpg';
      case CellType.Pit:
        return 'assets/pit.png';
      case CellType.Treasure:
        return 'assets/Treasure.jpg';
        case CellType.Empty:
          return 'assets/explored.png';
      default:
        return '';
    }
  }

  calculateBreeze(): void {
    for (let rowIndex = 0; rowIndex < this.board.length; rowIndex++) {
      for (let colIndex = 0; colIndex < this.board[rowIndex].length; colIndex++) {
        if (this.board[rowIndex][colIndex].type === CellType.Pit) {
          // For each adjacent cell, set the breeze property to true
          this.setBreezeOnAdjacentCells(rowIndex, colIndex);
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

    
  }
}
