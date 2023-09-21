import { Component, OnInit } from '@angular/core';
import { Cell, CellType } from 'src/app/models/cell';
import { Player } from 'src/app/models/player.model';
import { MessageModalComponent } from '../message-modal/message-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { GenerateGameService } from 'src/app/services/generate-game.service';
import { AIService } from 'src/app/services/ai.service';


@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  constructor(private dialog: MatDialog,
    private generateGame: GenerateGameService,
    private AI: AIService) { }

  board: Cell[][] = [];
  exploredBoard: Cell[][] = [];
  player: Player = new Player();


  ngOnInit(): void {
    //  this.player = this.AI.player;
    this.initializeBoard();
    this.board = this.generateGame.getBoard();
    this.generateGame.placePitsWumpusTreasure();  //get a board
    this.playGame(); // not implemented yet

  }


  playGame(){
    const gameInterval = setInterval(() => {
      if (!this.gameOver()) {
        const { row, column } = this.AI.makeAIMove();
  
        // Randomly decide if AI should move or shoot arrow
        const shouldShootArrow = Math.random() < 0.2; // ekahne hocche logic thakbe kokhon shoot korbe
  
        if (shouldShootArrow) {
          // AI decided to shoot an arrow
          this.AI.shootArrow(row, column); // You may need to provide valid row and column here
        } else {
          // AI decided to make a move
          this.revealCell(row, column);
        }
      } else {
        clearInterval(gameInterval);
        window.location.reload();
      }
    }, 1000);
  }
  


  initializeBoard(): void {
    this.generateGame.board = [];
    this.exploredBoard = [];
  
    for (let row = 0; row < 10; row++) {
      const newRow: Cell[] = [];
      for (let col = 0; col < 10; col++) {
        const newCell: Cell = {
          type: CellType.Empty,
          position: { row: row, col: col },
          isVisited: true,
          hasBreeze: false,
          hasSmell: false,
          hasLight: false,
          flag_score: 0
        };
        newRow.push(newCell);
      }
      this.generateGame.board.push(newRow);
      this.exploredBoard.push(newRow);
    }
  
    this.generateGame.board[0][0].isVisited = false;
    this.exploredBoard[0][0] = this.generateGame.board[0][0];
  
    // Convert an array of { row: number; col: number; } objects into an array of Cell objects
    const adjacentCells: Cell[] = this.AI.calculateAdjacentCells().map((position) => {
      return this.generateGame.board[position.row][position.col];
    });
  
    this.AI.availableCells = adjacentCells;
  }
  
  getCellImage(cellType: CellType): string {
    switch (cellType) {
      case CellType.Wumpus:
        return 'assets/wumpus.png';
      case CellType.DeadWumpus:
        return 'assets/deadWumpus.png';
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

  revealCell(rowIndex: number, colIndex: number): void {
    console.log(this.getCellTypeString(this.generateGame.board[rowIndex][colIndex].type));
  
    if (!this.gameOver() && this.isMoveAvailable(rowIndex, colIndex)) {
      this.generateGame.board[rowIndex][colIndex].isVisited = false;
      this.player.position = this.AI.player.position = { row: rowIndex, col: colIndex };
  
      // Convert an array of { row: number; col: number; } objects into an array of Cell objects
      const adjacentCells: Cell[] = this.AI.calculateAdjacentCells().map((position) => {
        return this.generateGame.board[position.row][position.col];
      });
  
      this.AI.availableCells = adjacentCells;
  
      this.exploredBoard[rowIndex][colIndex] = this.generateGame.board[rowIndex][colIndex];
      this.updateScore(rowIndex, colIndex);
    }
  }
  
  isMoveAvailable(rowIndex: number, colIndex: number): boolean {
    const adjacentCells = this.AI.calculateAdjacentCells();
    return adjacentCells.some(
      (move) => move.row === rowIndex && move.col === colIndex
    );
  }


shootArrow(row: number, col: number) {
  this.AI.shootArrow(row, col);
}

  updateScore(row: number, col: number) {
    this.player.point=this.AI.player.point -= 1;

    if (this.generateGame.board[row][col].type == CellType.Treasure) {
      this.player.point=this.AI.player.point += 1000;
      this.showMessage("Congratulations! You found the Treasure.")
    }

    else if (this.generateGame.board[row][col].type == CellType.Wumpus) {
      this.player.point=this.AI.player.point -= 1000;
      this.showMessage("Oops! Wumpus found you. Game over")
      //Game Over
    }
    else if (this.generateGame.board[row][col].type == CellType.Pit
      || this.generateGame.board[row][col].type == CellType.BreezeAndPit
      || this.generateGame.board[row][col].type == CellType.SmellAndPit
      || this.generateGame.board[row][col].type == CellType.LightAndPit) {
        this.player.point=this.AI.player.point -= 1000;
      this.showMessage("Oops! You fell on a pit. Game over")
      // alert('You fell on a pit!');
      // this.player.position = { row: 0, col: 0 };
    }

  }

  showMessage(message: string): void {
    const dialogRef = this.dialog.open(MessageModalComponent, {
      width: '300px',
      data: { message }
    });

    dialogRef.afterClosed().subscribe(() => {
      window.location.reload();
    });
  }

  getCellTypeString(cellType: CellType): string {
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

  gameOver() : boolean{
    if(this.AI.player.point<=0){    
      this.showMessage('Sorry. No moves left. Game Over.');
      return true;
    }
     
    else{
      return false;
    }
     
  }

}